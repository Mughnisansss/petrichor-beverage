import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '@/lib/db';
import type { OperationalCost } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const newCosts: Omit<OperationalCost, 'id'>[] = await request.json();
    const data = await readDb();
    
    if (!data.operationalCosts) {
      data.operationalCosts = [];
    }

    if (!newCosts || !Array.isArray(newCosts)) {
      return NextResponse.json({ message: 'Input tidak valid' }, { status: 400 });
    }

    const costsToAdd: OperationalCost[] = newCosts.map(cost => ({
      id: nanoid(),
      description: cost.description || 'Tanpa Deskripsi',
      amount: Number(cost.amount) || 0,
      date: cost.date || new Date().toISOString(),
      recurrence: cost.recurrence || 'sekali',
    }));

    data.operationalCosts.unshift(...costsToAdd);
    data.operationalCosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    await writeDb(data);
    return NextResponse.json(costsToAdd, { status: 201 });
  } catch(error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: `Gagal mengimpor data: ${errorMessage}` }, { status: 500 });
  }
}
