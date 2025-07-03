import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { Food } from '@/lib/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  // The client will recalculate costPrice based on ingredients and send it
  const updatedFoodData: Omit<Food, 'id'> = await request.json();
  const data = await readDb();
  
  if (!data.foods) {
    data.foods = [];
  }
  
  const foodIndex = data.foods.findIndex(d => d.id === id);
  if (foodIndex === -1) {
    return NextResponse.json({ message: 'Food not found' }, { status: 404 });
  }

  // Ensure we merge existing data with the update payload
  const updatedFood: Food = { ...data.foods[foodIndex], ...updatedFoodData, id };
  data.foods[foodIndex] = updatedFood;
  
  await writeDb(data);
  return NextResponse.json(updatedFood);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const data = await readDb();

  if (!data.foods) {
    data.foods = [];
  }

  // NOTE: Sales check is omitted as food sales are not yet tracked.
  // This can be added later if the Sale model is updated.
  
  const initialLength = data.foods.length;
  data.foods = data.foods.filter(d => d.id !== id);

  if (data.foods.length === initialLength) {
    return NextResponse.json({ message: 'Food not found' }, { status: 404 });
  }
  
  await writeDb(data);
  return NextResponse.json({ message: 'Makanan berhasil dihapus' }, { status: 200 });
}
