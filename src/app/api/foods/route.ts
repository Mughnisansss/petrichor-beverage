import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '@/lib/db';
import type { Food } from '@/lib/types';

export async function GET() {
  const data = await readDb();
  if (!data.foods) {
    data.foods = [];
  }
  return NextResponse.json(data.foods);
}

export async function POST(request: Request) {
  // The client will calculate costPrice based on ingredients and send it
  const newFood: Omit<Food, 'id'> = await request.json();
  const data = await readDb();

  if (!data.foods) {
    data.foods = [];
  }
  
  const foodToAdd: Food = { ...newFood, id: nanoid() };
  data.foods.push(foodToAdd);
  
  await writeDb(data);
  return NextResponse.json(foodToAdd, { status: 201 });
}
