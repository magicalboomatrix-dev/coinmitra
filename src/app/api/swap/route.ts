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

    const swaps = await transactionsCollection
      .find({ userId: new ObjectId(session.userId), type: 'Swap' })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      swaps: swaps.map(tx => ({
        id: tx._id.toString(),
        type: tx.type,
        amount: tx.amount,
        inrAmount: tx.inrAmount,
        rate: tx.rate,
        status: tx.status,
        createdAt: tx.createdAt
      }))
    });
  } catch (error) {
    console.error('Error in swap GET:', error);
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
    const numericRate = settings?.usdtRate || 111.00;

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Invalid swap amount' }, { status: 400 });
    }

    const usersCollection = db.collection('users');
    const transactionsCollection = db.collection('transactions');

    const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentBalance = user.balance ?? 10.00;
    if (currentBalance < numericAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Deduct USDT balance
    const updatedBalance = currentBalance - numericAmount;
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { balance: updatedBalance, updatedAt: new Date() }
      }
    );

    // Create swap record (auto-success)
    const inrAmount = numericAmount * numericRate;
    const newTx = {
      userId: new ObjectId(session.userId),
      userPhone: session.phone,
      type: 'Swap',
      amount: numericAmount,
      inrAmount: inrAmount,
      rate: numericRate,
      status: 'Success',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await transactionsCollection.insertOne(newTx);

    return NextResponse.json({
      success: true,
      message: 'Swap completed successfully',
      balance: updatedBalance,
      transaction: {
        id: result.insertedId.toString(),
        ...newTx
      }
    });
  } catch (error) {
    console.error('Error in swap POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
