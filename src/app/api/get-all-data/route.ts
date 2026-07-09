import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

export async function GET() {
  try {
    const data = await readDb();
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ message: `Failed to read data: ${errorMessage}` }, { status: 500 });
  }
}
