import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '@/lib/db';
import type { OperationalCost } from '@/lib/types';

export async function GET() {
  const data = await readDb();
  // Add default for backward compatibility
  const costsWithDefaults = (data.operationalCosts || []).map(cost => ({
    ...cost,
    recurrence: cost.recurrence || 'sekali'
  }));
  // Sort costs by date in descending order (newest first)
  const sortedCosts = costsWithDefaults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json(sortedCosts);
}

export async function POST(request: Request) {
  const newCostData: Omit<OperationalCost, 'id' | 'date'> = await request.json();
  const data = await readDb();
  
  const costToAdd: OperationalCost = { 
    ...newCostData, 
    id: nanoid(),
    date: new Date().toISOString()
  };

  data.operationalCosts.unshift(costToAdd);
  
  await writeDb(data);
  return NextResponse.json(costToAdd, { status: 201 });
}
