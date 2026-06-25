import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

async function getAuthUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie || !sessionCookie.value) return null;

  const payload = await verifyToken(sessionCookie.value);
  if (!payload) return null;

  return payload;
}

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('coinmitra');
    const transactionsCollection = db.collection('transactions');

    const withdrawals = await transactionsCollection
      .find({ userId: new ObjectId(session.userId), type: 'Withdraw' })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      withdrawals: withdrawals.map(tx => ({
        id: tx._id.toString(),
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        remarks: tx.remarks || '',
        createdAt: tx.createdAt
      }))
    });
  } catch (error) {
    console.error('Error in withdraw GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body;

    const numericAmount = parseFloat(amount);

    const client = await clientPromise;
    const db = client.db('coinmitra');
    const settingsCollection = db.collection('settings');
    const settings = await settingsCollection.findOne({ _id: 'global' as any });
    const minWithdraw = settings?.minWithdraw ?? 10;

    if (isNaN(numericAmount) || numericAmount < minWithdraw) {
      return NextResponse.json({ error: `Minimum withdrawal is ${minWithdraw} USDT` }, { status: 400 });
    }

    const usersCollection = db.collection('users');
    const transactionsCollection = db.collection('transactions');

    // Fetch user and verify balance
    const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentBalance = user.balance ?? 10.00;
    if (currentBalance < numericAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Deduct balance and create pending withdraw transaction
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { balance: currentBalance - numericAmount, updatedAt: new Date() }
      }
    );

    const newTx = {
      userId: new ObjectId(session.userId),
      userPhone: session.phone,
      type: 'Withdraw',
      amount: numericAmount,
      status: 'Pending',
      remarks: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await transactionsCollection.insertOne(newTx);

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted. Pending admin approval.',
      transaction: {
        id: result.insertedId.toString(),
        ...newTx
      }
    });
  } catch (error) {
    console.error('Error in withdraw POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
