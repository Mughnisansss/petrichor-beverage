import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { OperationalCost } from '@/lib/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const updatedCostData: Omit<OperationalCost, 'id' | 'date'> = await request.json();
  const data = await readDb();
  
  const costIndex = data.operationalCosts.findIndex(c => c.id === id);
  if (costIndex === -1) {
    return NextResponse.json({ message: 'Cost not found' }, { status: 404 });
  }
  
  const updatedCost: OperationalCost = { ...data.operationalCosts[costIndex], ...updatedCostData, id };
  data.operationalCosts[costIndex] = updatedCost;
  
  await writeDb(data);
  return NextResponse.json(updatedCost);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const data = await readDb();
  
  const initialLength = data.operationalCosts.length;
  data.operationalCosts = data.operationalCosts.filter(c => c.id !== id);

  if (data.operationalCosts.length === initialLength) {
    return NextResponse.json({ message: 'Cost not found' }, { status: 404 });
  }
  
  await writeDb(data);
  return NextResponse.json({ message: 'Cost deleted' }, { status: 200 });
}
