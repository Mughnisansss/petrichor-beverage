import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST() {
  const data = await readDb();
  
  data.user = null;
  
  await writeDb(data);

  return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
}
