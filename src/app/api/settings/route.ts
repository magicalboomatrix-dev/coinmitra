import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('coinmitra');
    const settingsCollection = db.collection('settings');

    const settings = await settingsCollection.findOne({ _id: 'global' as any });

    return NextResponse.json({
      success: true,
      usdtRate: settings?.usdtRate ?? 111.00,
      minDeposit: settings?.minDeposit ?? 10,
      minWithdraw: settings?.minWithdraw ?? 10
    });
  } catch (error) {
    console.error('Error in settings GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
