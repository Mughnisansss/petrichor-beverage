import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { Drink } from '@/lib/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const updatedDrinkData: Omit<Drink, 'id'> = await request.json();
  const data = await readDb();
  
  const drinkIndex = data.drinks.findIndex(d => d.id === id);
  if (drinkIndex === -1) {
    return NextResponse.json({ message: 'Drink not found' }, { status: 404 });
  }

  const updatedDrink: Drink = { ...updatedDrinkData, id };
  data.drinks[drinkIndex] = updatedDrink;
  
  await writeDb(data);
  return NextResponse.json(updatedDrink);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const data = await readDb();
  
  const initialLength = data.drinks.length;
  data.drinks = data.drinks.filter(d => d.id !== id);

  if (data.drinks.length === initialLength) {
    return NextResponse.json({ message: 'Drink not found' }, { status: 404 });
  }
  
  await writeDb(data);
  return NextResponse.json({ message: 'Drink deleted' }, { status: 200 });
}
