import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set('session', '', {
      httpOnly: true,
      path: '/',
      expires: new Date(0), // Set to historical date to immediately expire
      maxAge: 0
    });

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logout route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
