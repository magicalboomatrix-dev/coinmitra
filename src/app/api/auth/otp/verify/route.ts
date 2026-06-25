import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import clientPromise from '@/lib/mongodb';
import { signToken } from '@/lib/auth';

function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.length === 10) {
    cleaned = '+91' + cleaned;
  }
  return cleaned;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    const client = await clientPromise;
    const db = client.db('coinmitra');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ phone: normalizedPhone });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate OTP
    if (!user.otp || !user.otp.code) {
      return NextResponse.json({ error: 'No OTP requested for this phone number' }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(user.otp.expiresAt);

    if (now > expiresAt) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    if (user.otp.code !== otp) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Clear OTP and mark verified
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          updatedAt: new Date()
        },
        $unset: {
          otp: ''
        }
      }
    );

    // Create session token (expires in 7 days)
    const sessionExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const token = await signToken({
      userId: user._id.toString(),
      phone: user.phone,
      expires: sessionExpiry
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      sameSite: 'lax'
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        balance: user.balance
      }
    });

  } catch (error: any) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
