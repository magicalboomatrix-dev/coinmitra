import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export type AdminSession = {
  adminId: string;
  email: string;
  role: 'admin';
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  if (!sessionCookie?.value) return null;

  const payload = await verifyToken(sessionCookie.value);
  if (!payload?.adminId || payload.role !== 'admin' || !payload.email) return null;

  const client = await clientPromise;
  const db = client.db('coinmitra');
  const admin = await db.collection('admins').findOne({
    _id: new ObjectId(payload.adminId),
    email: payload.email,
    isActive: { $ne: false },
  });

  if (!admin) return null;

  return {
    adminId: payload.adminId,
    email: payload.email,
    role: 'admin',
  };
}
