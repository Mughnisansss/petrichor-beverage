import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '@/lib/db';
import type { Drink } from '@/lib/types';
import { calculateItemCostPrice } from '@/lib/data-logic';

export async function GET() {
  const data = await readDb();
  return NextResponse.json(data.drinks);
}

export async function POST(request: Request) {
  const newDrinkData: Omit<Drink, 'id' | 'costPrice'> = await request.json();
  const data = await readDb();
  
  // Server-side cost calculation
  const costPrice = calculateItemCostPrice(newDrinkData.ingredients, data.rawMaterials);
  
  const drinkToAdd: Drink = { ...newDrinkData, id: nanoid(), costPrice };
  data.drinks.push(drinkToAdd);
  
  await writeDb(data);
  return NextResponse.json(drinkToAdd, { status: 201 });
}
