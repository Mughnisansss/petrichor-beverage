
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '@/lib/db';
import type { RawMaterial } from '@/lib/types';

export async function GET() {
  const data = await readDb();
  // Add default category for backward compatibility
  const materialsWithDefaults = (data.rawMaterials || []).map(material => ({
    ...material,
    category: material.category || 'main'
  }));
  return NextResponse.json(materialsWithDefaults);
}

export async function POST(request: Request) {
  const newRawMaterial: Omit<RawMaterial, 'id'> = await request.json();
  const data = await readDb();
  
  if (!data.rawMaterials) {
    data.rawMaterials = [];
  }
  
  // Ensure category has a value, default to 'main'
  const materialToAdd: RawMaterial = { 
    ...newRawMaterial, 
    id: nanoid(),
    category: newRawMaterial.category || 'main'
  };
  data.rawMaterials.push(materialToAdd);
  
  await writeDb(data);
  return NextResponse.json(materialToAdd, { status: 201 });
}
