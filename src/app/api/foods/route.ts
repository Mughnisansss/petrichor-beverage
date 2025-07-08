import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '@/lib/db';
import type { Food } from '@/lib/types';
import { calculateItemCostPrice } from '@/lib/data-logic';

export async function GET() {
  const data = await readDb();
  if (!data.foods) {
    data.foods = [];
  }
  return NextResponse.json(data.foods);
}

export async function POST(request: Request) {
  const newFoodData: Omit<Food, 'id' | 'costPrice'> = await request.json();
  const data = await readDb();

  if (!data.foods) {
    data.foods = [];
  }
  
  const costPrice = calculateItemCostPrice(newFoodData.ingredients, data.rawMaterials);
  
  const foodToAdd: Food = { ...newFoodData, id: nanoid(), costPrice };
  data.foods.push(foodToAdd);
  
  await writeDb(data);
  return NextResponse.json(foodToAdd, { status: 201 });
}
