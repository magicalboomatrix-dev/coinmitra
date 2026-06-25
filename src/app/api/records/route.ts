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

    const records = await transactionsCollection
      .find({ userId: new ObjectId(session.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      records: records.map(tx => ({
        id: tx._id.toString(),
        type: tx.type,
        amount: tx.type === 'Swap' ? `${tx.amount} USDT` : `${tx.amount >= 0 ? '+' : ''}${tx.amount} USDT`,
        displayAmount: tx.type === 'Swap' ? `${tx.amount} USDT` : `${tx.type === 'Deposit' ? '+' : '-'}${tx.amount} USDT`,
        status: tx.status,
        remarks: tx.remarks || '',
        createdAt: tx.createdAt
      }))
    });
  } catch (error) {
    console.error('Error in records GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
