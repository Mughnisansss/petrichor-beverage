import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { User } from '@/lib/types';

export async function POST() {
  const data = await readDb();

  // Create a dummy user for the simulation
  const dummyUser: User = {
    name: "Alex Doe",
    email: "alex.doe@example.com",
    avatar: "https://placehold.co/100x100.png"
  };

  data.user = dummyUser;
  
  await writeDb(data);

  return NextResponse.json(dummyUser, { status: 200 });
}
