import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pbkdf2Sync, timingSafeEqual } from 'node:crypto';
import clientPromise from '@/lib/mongodb';
import { signToken } from '@/lib/auth';

function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, iterationsValue, salt, storedHash] = passwordHash.split(':');
  const iterations = Number(iterationsValue);

  if (algorithm !== 'pbkdf2_sha256' || !iterations || !salt || !storedHash) {
    return false;
  }

  const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');
  return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('coinmitra');
    const admin = await db.collection('admins').findOne({
      email: normalizedEmail,
      isActive: { $ne: false },
    });

    if (!admin || !verifyPassword(String(password), admin.passwordHash)) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const expires = Date.now() + 12 * 60 * 60 * 1000;
    const token = await signToken({
      userId: '',
      phone: '',
      adminId: admin._id.toString(),
      email: admin.email,
      role: 'admin',
      expires,
    });

    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 12 * 60 * 60,
      sameSite: 'lax',
    });

    await db.collection('admins').updateOne(
      { _id: admin._id },
      { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Error in admin login:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
