import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getAdminSession } from '@/lib/admin-auth';

type SettingsDocument = {
  _id: string;
  usdtRate?: number;
  minDeposit?: number;
  minWithdraw?: number;
  updatedAt?: Date;
  updatedBy?: string;
};

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('coinmitra');
    const settingsCollection = db.collection<SettingsDocument>('settings');
    const settings = await settingsCollection.findOne({ _id: 'global' });

    return NextResponse.json({
      success: true,
      usdtRate: settings?.usdtRate ?? 111,
      minDeposit: settings?.minDeposit ?? 10,
      minWithdraw: settings?.minWithdraw ?? 10,
    });
  } catch (error) {
    console.error('Error in admin settings GET:', error);
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
    const updateFields: Partial<SettingsDocument> = {
      updatedAt: new Date(),
      updatedBy: admin.email,
    };

    if (body.usdtRate !== undefined) {
      const numericRate = Number(body.usdtRate);
      if (!Number.isFinite(numericRate) || numericRate <= 0) {
        return NextResponse.json({ error: 'Invalid exchange rate' }, { status: 400 });
      }
      updateFields.usdtRate = numericRate;
    }

    if (body.minDeposit !== undefined) {
      const numericMinDeposit = Number(body.minDeposit);
      if (!Number.isFinite(numericMinDeposit) || numericMinDeposit <= 0) {
        return NextResponse.json({ error: 'Invalid minimum deposit' }, { status: 400 });
      }
      updateFields.minDeposit = numericMinDeposit;
    }

    if (body.minWithdraw !== undefined) {
      const numericMinWithdraw = Number(body.minWithdraw);
      if (!Number.isFinite(numericMinWithdraw) || numericMinWithdraw <= 0) {
        return NextResponse.json({ error: 'Invalid minimum withdrawal' }, { status: 400 });
      }
      updateFields.minWithdraw = numericMinWithdraw;
    }

    const client = await clientPromise;
    const db = client.db('coinmitra');
    const settingsCollection = db.collection<SettingsDocument>('settings');

    await settingsCollection.updateOne(
      { _id: 'global' },
      { $set: updateFields },
      { upsert: true }
    );

    const updated = await settingsCollection.findOne({ _id: 'global' });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      usdtRate: updated?.usdtRate ?? 111,
      minDeposit: updated?.minDeposit ?? 10,
      minWithdraw: updated?.minWithdraw ?? 10,
    });
  } catch (error) {
    console.error('Error in admin settings POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
