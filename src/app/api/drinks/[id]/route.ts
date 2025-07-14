import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { hasDrinkAssociatedSales, calculateItemCostPrice } from '@/lib/data-logic';
import type { Drink } from '@/lib/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const updatedDrinkData: Partial<Omit<Drink, 'id'>> = await request.json();
  const data = await readDb();
  
  const drinkIndex = data.drinks.findIndex(d => d.id === id);
  if (drinkIndex === -1) {
    return NextResponse.json({ message: 'Drink not found' }, { status: 404 });
  }

  const existingDrink = data.drinks[drinkIndex];
  
  // Recalculate costPrice on the server if ingredients change
  if (updatedDrinkData.ingredients) {
      updatedDrinkData.costPrice = calculateItemCostPrice(updatedDrinkData.ingredients, data.rawMaterials);
  }

  // Ensure we merge existing data with the update payload
  const updatedDrink: Drink = { ...existingDrink, ...updatedDrinkData, id };
  data.drinks[drinkIndex] = updatedDrink;
  
  await writeDb(data);
  return NextResponse.json(updatedDrink);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const data = await readDb();

  // Use centralized logic to check for sales records
  if (hasDrinkAssociatedSales(data, id)) {
    return NextResponse.json(
      { message: 'Minuman tidak dapat dihapus karena memiliki riwayat penjualan.' },
      { status: 400 } // Use 400 for a client error
    );
  }
  
  const initialLength = data.drinks.length;
  data.drinks = data.drinks.filter(d => d.id !== id);

  if (data.drinks.length === initialLength) {
    return NextResponse.json({ message: 'Drink not found' }, { status: 404 });
  }
  
  await writeDb(data);
  return NextResponse.json({ message: 'Minuman berhasil dihapus.' }, { status: 200 });
}
