import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

// Helper to authenticate user from session
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
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      banks: user.paymentMethods?.banks || [],
      upis: user.paymentMethods?.upis || []
    });
  } catch (error) {
    console.error('Error in payment-methods GET:', error);
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
    const { type, ...details } = body;

    if (!type || (type !== 'bank' && type !== 'upi')) {
      return NextResponse.json({ error: 'Invalid payment method type' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('coinmitra');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newMethodId = new ObjectId().toString();
    const paymentMethodEntry = {
      id: newMethodId,
      ...details,
      selectedForSmartSwap: details.selectedForSmartSwap ?? true,
      createdAt: new Date()
    };

    let updateQuery = {};
    if (type === 'bank') {
      if (!details.accountHolder || !details.accountNumber || !details.ifsc) {
        return NextResponse.json({ error: 'Missing bank account details' }, { status: 400 });
      }
      updateQuery = { $push: { 'paymentMethods.banks': paymentMethodEntry } };
    } else {
      if (!details.upiId) {
        return NextResponse.json({ error: 'Missing UPI ID' }, { status: 400 });
      }
      updateQuery = { $push: { 'paymentMethods.upis': paymentMethodEntry } };
    }

    await usersCollection.updateOne(
      { _id: user._id },
      updateQuery
    );

    return NextResponse.json({
      success: true,
      message: 'Payment method added successfully',
      method: paymentMethodEntry
    });
  } catch (error) {
    console.error('Error in payment-methods POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type || (type !== 'bank' && type !== 'upi')) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('coinmitra');
    const usersCollection = db.collection('users');

    let pullQuery = {};
    if (type === 'bank') {
      pullQuery = { $pull: { 'paymentMethods.banks': { id: id } } };
    } else {
      pullQuery = { $pull: { 'paymentMethods.upis': { id: id } } };
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(session.userId) },
      pullQuery
    );

    return NextResponse.json({ success: true, message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error in payment-methods DELETE:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
