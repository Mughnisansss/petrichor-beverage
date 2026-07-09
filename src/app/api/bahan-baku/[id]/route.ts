import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { isRawMaterialInUse, recalculateDependentProductCosts } from '@/lib/data-logic';
import type { RawMaterial, Drink, Food } from '@/lib/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const updatedMaterialData: Omit<RawMaterial, 'id'> = await request.json();
  const data = await readDb();

  if (!data.rawMaterials) {
     return NextResponse.json({ message: 'Raw material storage not found' }, { status: 500 });
  }
  
  const materialIndex = data.rawMaterials.findIndex(m => m.id === id);
  if (materialIndex === -1) {
    return NextResponse.json({ message: 'Raw material not found' }, { status: 404 });
  }

  const oldCostPerUnit = data.rawMaterials[materialIndex].costPerUnit;

  // Update the material
  const updatedMaterial: RawMaterial = { ...data.rawMaterials[materialIndex], ...updatedMaterialData, id };
  data.rawMaterials[materialIndex] = updatedMaterial;

  // Only recalculate product costs if the HPP of the material has changed.
  // This prevents recalculation when only stock quantity is updated.
  if (updatedMaterial.costPerUnit !== oldCostPerUnit) {
    recalculateDependentProductCosts(data, id);
  }

  await writeDb(data);
  return NextResponse.json(updatedMaterial);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const data = await readDb();

  if (!data.rawMaterials) {
     return NextResponse.json({ message: 'Raw material storage not found' }, { status: 500 });
  }

  // Use centralized logic to check if material is in use
  if (isRawMaterialInUse(data, id)) {
    return NextResponse.json(
      { message: 'Bahan baku tidak dapat dihapus karena masih digunakan dalam resep.' },
      { status: 400 }
    );
  }
  
  const initialLength = data.rawMaterials.length;
  data.rawMaterials = data.rawMaterials.filter(m => m.id !== id);

  if (data.rawMaterials.length === initialLength) {
    return NextResponse.json({ message: 'Raw material not found' }, { status: 404 });
  }
  
  await writeDb(data);
  return NextResponse.json({ message: 'Bahan baku berhasil dihapus' }, { status: 200 });
}
