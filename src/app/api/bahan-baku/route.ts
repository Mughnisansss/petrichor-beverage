import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '@/lib/db';
import type { RawMaterial } from '@/lib/types';

export async function GET() {
  const data = await readDb();
  return NextResponse.json(data.rawMaterials || []);
}

export async function POST(request: Request) {
  const newRawMaterial: Omit<RawMaterial, 'id'> = await request.json();
  const data = await readDb();
  
  if (!data.rawMaterials) {
    data.rawMaterials = [];
  }
  
  const materialToAdd: RawMaterial = { ...newRawMaterial, id: nanoid() };
  data.rawMaterials.push(materialToAdd);
  
  await writeDb(data);
  return NextResponse.json(materialToAdd, { status: 201 });
}
