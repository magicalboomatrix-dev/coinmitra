import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { getAdminSession } from '@/lib/admin-auth';

type TransactionType = 'Deposit' | 'Withdraw' | 'Swap';
type TransactionStatus = 'Pending' | 'Success' | 'Failed';

type TransactionDocument = {
  _id: ObjectId;
  userId: ObjectId;
  userPhone: string;
  type: TransactionType;
  amount: number;
  inrAmount?: number;
  rate?: number;
  status: TransactionStatus;
  remarks?: string;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
};

type UserDocument = {
  _id: ObjectId;
  phone: string;
  balance?: number;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

function serializeTransaction(tx: TransactionDocument, user?: UserDocument | null) {
  return {
    id: tx._id.toString(),
    userId: tx.userId.toString(),
    userPhone: tx.userPhone,
    type: tx.type,
    amount: tx.amount,
    inrAmount: tx.inrAmount || 0,
    rate: tx.rate || 0,
    status: tx.status,
    remarks: tx.remarks || '',
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt || tx.createdAt,
    user: user
      ? {
          id: user._id.toString(),
          phone: user.phone,
          balance: user.balance ?? 10,
          isVerified: Boolean(user.isVerified),
          createdAt: user.createdAt,
        }
      : null,
  };
}

export async function GET(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as TransactionType | null;
    const status = searchParams.get('status') as TransactionStatus | null;
    const search = searchParams.get('search')?.trim();
    const id = searchParams.get('id');

    const client = await clientPromise;
    const db = client.db('coinmitra');
    const transactionsCollection = db.collection<TransactionDocument>('transactions');
    const usersCollection = db.collection<UserDocument>('users');

    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
      }

      const tx = await transactionsCollection.findOne({ _id: new ObjectId(id) });
      if (!tx) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      const user = await usersCollection.findOne({ _id: tx.userId });
      return NextResponse.json({ success: true, transaction: serializeTransaction(tx, user) });
    }

    const query: Partial<Pick<TransactionDocument, 'type' | 'status'>> & {
      $or?: Array<Record<string, unknown>>;
    } = {};

    if (type && ['Deposit', 'Withdraw', 'Swap'].includes(type)) query.type = type;
    if (status && ['Pending', 'Success', 'Failed'].includes(status)) query.status = status;
    if (search) {
      query.$or = [
        { userPhone: { $regex: search, $options: 'i' } },
        ...(ObjectId.isValid(search) ? [{ _id: new ObjectId(search) }, { userId: new ObjectId(search) }] : []),
      ];
    }

    const transactions = await transactionsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(300)
      .toArray();

    const stats = await transactionsCollection
      .aggregate([
        {
          $group: {
            _id: { type: '$type', status: '$status' },
            count: { $sum: 1 },
            amount: { $sum: '$amount' },
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      transactions: transactions.map((tx) => serializeTransaction(tx)),
      stats,
    });
  } catch (error) {
    console.error('Error in admin transactions GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const transactionId = String(body.transactionId || '');
    const action = body.action;
    const remarks = String(body.remarks || '').trim();

    if (!ObjectId.isValid(transactionId) || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json({ error: 'Invalid arguments' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('coinmitra');
    const transactionsCollection = db.collection<TransactionDocument>('transactions');
    const usersCollection = db.collection<UserDocument>('users');

    const tx = await transactionsCollection.findOne({ _id: new ObjectId(transactionId) });
    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (tx.status !== 'Pending') {
      return NextResponse.json({ error: 'Transaction is already processed' }, { status: 400 });
    }

    const user = await usersCollection.findOne({ _id: tx.userId });
    if (!user) {
      return NextResponse.json({ error: 'User associated with transaction not found' }, { status: 404 });
    }

    const currentBalance = user.balance ?? 10;
    const status: TransactionStatus = action === 'approve' ? 'Success' : 'Failed';
    const fallbackRemarks = action === 'approve' ? `Approved by ${admin.email}` : `Rejected by ${admin.email}`;

    if (action === 'approve' && tx.type === 'Deposit') {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { balance: currentBalance + tx.amount, updatedAt: new Date() } }
      );
    }

    if (action === 'reject' && tx.type === 'Withdraw') {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { balance: currentBalance + tx.amount, updatedAt: new Date() } }
      );
    }

    await transactionsCollection.updateOne(
      { _id: tx._id },
      {
        $set: {
          status,
          remarks: remarks || fallbackRemarks,
          reviewedBy: admin.email,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Transaction ${status === 'Success' ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    console.error('Error in admin transactions POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
