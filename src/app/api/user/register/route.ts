import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { User } from '@/lib/types';

export async function POST(request: Request) {
  const { name, email, password } = await request.json();
  const data = await readDb();

  // Overwrite dummy credentials with the new ones
  data.username = email;
  data.password = password;

  // Create a new user object for the session
  const newUser: User = {
    name: name,
    email: email,
    avatar: `https://placehold.co/100x100.png?text=${name.charAt(0)}`
  };

  // Log the user in immediately after registration
  data.user = newUser;
  
  await writeDb(data);

  return NextResponse.json(newUser, { status: 201 });
}
