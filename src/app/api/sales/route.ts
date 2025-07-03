import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '@/lib/db';
import type { Sale } from '@/lib/types';

export async function GET() {
  const data = await readDb();
  // Sort sales by date in descending order (newest first)
  const sortedSales = data.sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json(sortedSales);
}

export async function POST(request: Request) {
  const newSaleData: Omit<Sale, 'id' | 'date'> = await request.json();
  const data = await readDb();
  
  const saleToAdd: Sale = { 
    ...newSaleData, 
    id: nanoid(),
    date: new Date().toISOString()
  };
  
  data.sales.unshift(saleToAdd); 
  
  await writeDb(data);
  return NextResponse.json(saleToAdd, { status: 201 });
}
