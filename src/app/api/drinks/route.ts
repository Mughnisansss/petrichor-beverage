import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '@/lib/db';
import type { Drink } from '@/lib/types';

export async function GET() {
  const data = await readDb();
  return NextResponse.json(data.drinks);
}

export async function POST(request: Request) {
  const newDrink: Omit<Drink, 'id'> = await request.json();
  const data = await readDb();
  
  const drinkToAdd: Drink = { ...newDrink, id: nanoid() };
  data.drinks.push(drinkToAdd);
  
  await writeDb(data);
  return NextResponse.json(drinkToAdd, { status: 201 });
}
