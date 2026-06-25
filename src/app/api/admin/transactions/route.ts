import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('coinmitra');
    const transactionsCollection = db.collection('transactions');

    const transactions = await transactionsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      transactions: transactions.map(tx => ({
        id: tx._id.toString(),
        userId: tx.userId.toString(),
        userPhone: tx.userPhone,
        type: tx.type,
        amount: tx.amount,
        inrAmount: tx.inrAmount || 0,
        rate: tx.rate || 0,
        status: tx.status,
        remarks: tx.remarks || '',
        createdAt: tx.createdAt
      }))
    });
  } catch (error) {
    console.error('Error in admin GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId, action, remarks } = body;

    if (!transactionId || !action || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json({ error: 'Invalid arguments' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('coinmitra');
    const transactionsCollection = db.collection('transactions');
    const usersCollection = db.collection('users');

    const tx = await transactionsCollection.findOne({ _id: new ObjectId(transactionId) });
    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (tx.status !== 'Pending') {
      return NextResponse.json({ error: 'Transaction is already processed' }, { status: 400 });
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(tx.userId) });
    if (!user) {
      return NextResponse.json({ error: 'User associated with transaction not found' }, { status: 404 });
    }

    const currentBalance = user.balance ?? 10.00;

    if (action === 'approve') {
      // Approve transaction
      if (tx.type === 'Deposit') {
        // Increment user balance
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { balance: currentBalance + tx.amount, updatedAt: new Date() } }
        );
      }
      // For Withdraw, balance is already deducted at request time, so no balance update is needed
      await transactionsCollection.updateOne(
        { _id: tx._id },
        { 
          $set: { status: 'Success', remarks: remarks || 'Approved by admin', updatedAt: new Date() }
        }
      );
    } else {
      // Reject transaction
      if (tx.type === 'Withdraw') {
        // Refund user balance
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { balance: currentBalance + tx.amount, updatedAt: new Date() } }
        );
      }
      await transactionsCollection.updateOne(
        { _id: tx._id },
        { 
          $set: { status: 'Failed', remarks: remarks || 'Rejected by admin', updatedAt: new Date() }
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Transaction successfully ${action}d`
    });
  } catch (error) {
    console.error('Error in admin POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
