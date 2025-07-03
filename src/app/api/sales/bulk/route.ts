
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '@/lib/db';
import type { Sale } from '@/lib/types';

export async function POST(request: Request) {
  // Now expecting sales to have `totalSalePrice` and optionally `selectedToppings`
  const salesToAdd: Omit<Sale, 'id' | 'date'>[] = await request.json();
  const data = await readDb();
  
  if (!salesToAdd || !Array.isArray(salesToAdd)) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
  }

  const newSales: Sale[] = salesToAdd.map(sale => ({
    ...sale,
    id: nanoid(),
    date: new Date().toISOString()
  }));

  data.sales.unshift(...newSales);
  data.sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  await writeDb(data);
  return NextResponse.json(newSales, { status: 201 });
}
