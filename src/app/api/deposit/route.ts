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

    const deposits = await transactionsCollection
      .find({ userId: new ObjectId(session.userId), type: 'Deposit' })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      deposits: deposits.map(tx => ({
        id: tx._id.toString(),
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        remarks: tx.remarks || '',
        createdAt: tx.createdAt
      }))
    });
  } catch (error) {
    console.error('Error in deposit GET:', error);
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
    const minDeposit = settings?.minDeposit ?? 10;

    if (isNaN(numericAmount) || numericAmount < minDeposit) {
      return NextResponse.json({ error: `Minimum deposit is ${minDeposit} USDT` }, { status: 400 });
    }

    const transactionsCollection = db.collection('transactions');

    const newTx = {
      userId: new ObjectId(session.userId),
      userPhone: session.phone,
      type: 'Deposit',
      amount: numericAmount,
      status: 'Pending',
      remarks: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await transactionsCollection.insertOne(newTx);

    return NextResponse.json({
      success: true,
      message: 'Deposit request created. Pending admin verification.',
      transaction: {
        id: result.insertedId.toString(),
        ...newTx
      }
    });
  } catch (error) {
    console.error('Error in deposit POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
