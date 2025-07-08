
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '@/lib/db';
import type { Sale } from '@/lib/types';
import { deductStockForSaleItems } from '@/lib/data-logic';

export async function POST(request: Request) {
  const salesToAdd: Omit<Sale, 'id' | 'date'>[] = await request.json();
  const data = await readDb();
  
  if (!salesToAdd || !Array.isArray(salesToAdd)) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
  }

  // Perform stock deduction for all items in the batch
  deductStockForSaleItems(salesToAdd, data);

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
