import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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
    const settingsCollection = db.collection('settings');

    const settings = await settingsCollection.findOne({ _id: 'global' as any });
    
    return NextResponse.json({
      success: true,
      usdtRate: settings?.usdtRate ?? 111.00,
      minDeposit: settings?.minDeposit ?? 10,
      minWithdraw: settings?.minWithdraw ?? 10
    });
  } catch (error) {
    console.error('Error in admin settings GET:', error);
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
    const { usdtRate, minDeposit, minWithdraw } = body;

    // Build $set object dynamically — only update fields that are provided
    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
      updatedBy: session.phone
    };

    if (usdtRate !== undefined) {
      const numericRate = parseFloat(usdtRate);
      if (isNaN(numericRate) || numericRate <= 0) {
        return NextResponse.json({ error: 'Invalid exchange rate' }, { status: 400 });
      }
      updateFields.usdtRate = numericRate;
    }

    if (minDeposit !== undefined) {
      const numericMinDeposit = parseFloat(minDeposit);
      if (isNaN(numericMinDeposit) || numericMinDeposit <= 0) {
        return NextResponse.json({ error: 'Invalid minimum deposit' }, { status: 400 });
      }
      updateFields.minDeposit = numericMinDeposit;
    }

    if (minWithdraw !== undefined) {
      const numericMinWithdraw = parseFloat(minWithdraw);
      if (isNaN(numericMinWithdraw) || numericMinWithdraw <= 0) {
        return NextResponse.json({ error: 'Invalid minimum withdrawal' }, { status: 400 });
      }
      updateFields.minWithdraw = numericMinWithdraw;
    }

    const client = await clientPromise;
    const db = client.db('coinmitra');
    const settingsCollection = db.collection('settings');

    await settingsCollection.updateOne(
      { _id: 'global' as any },
      { $set: updateFields },
      { upsert: true }
    );

    // Fetch updated doc to return current values
    const updated = await settingsCollection.findOne({ _id: 'global' as any });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      usdtRate: updated?.usdtRate ?? 111.00,
      minDeposit: updated?.minDeposit ?? 10,
      minWithdraw: updated?.minWithdraw ?? 10
    });
  } catch (error) {
    console.error('Error in admin settings POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
