import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST() {
  const data = await readDb();
  
  if (data.user) {
    data.user.subscriptionStatus = 'premium';
    await writeDb(data);
    return NextResponse.json(data.user, { status: 200 });
  } else {
    return NextResponse.json({ message: 'User not logged in' }, { status: 401 });
  }
}
