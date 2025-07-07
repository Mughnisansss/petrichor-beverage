import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { User } from '@/lib/types';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const data = await readDb();

  // Check credentials against the dummy credentials in db.json
  if (email === data.username && password === data.password) {
    // Create a dummy user for the simulation
    const dummyUser: User = {
      name: "Alex Doe",
      email: "alex.doe@example.com",
      avatar: "https://placehold.co/100x100.png"
    };

    data.user = dummyUser;
    
    await writeDb(data);

    return NextResponse.json(dummyUser, { status: 200 });
  } else {
    // If credentials do not match, return an error
    return NextResponse.json({ message: 'Email atau kata sandi salah.' }, { status: 401 });
  }
}
