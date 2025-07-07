
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '@/lib/db';
import type { RawMaterial } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const newMaterials: Omit<RawMaterial, 'id'>[] = await request.json();
    const data = await readDb();
    
    if (!data.rawMaterials) {
      data.rawMaterials = [];
    }

    if (!newMaterials || !Array.isArray(newMaterials)) {
      return NextResponse.json({ message: 'Input tidak valid' }, { status: 400 });
    }
    
    const materialsToAdd: RawMaterial[] = newMaterials.map(mat => {
      const purchaseQuantity = Number(mat.totalQuantity) || 0;
      const purchaseCost = Number(mat.totalCost) || 0;
      const costPerUnit = purchaseQuantity > 0 ? purchaseCost / purchaseQuantity : 0;
      return {
          id: nanoid(),
          name: mat.name || 'Tanpa Nama',
          unit: mat.unit || 'pcs',
          totalQuantity: purchaseQuantity,
          totalCost: purchaseCost,
          costPerUnit: costPerUnit,
          lastPurchaseQuantity: purchaseQuantity,
          lastPurchaseCost: purchaseCost,
          category: mat.category || 'main',
          sellingPrice: mat.sellingPrice || costPerUnit,
        }
    });

    data.rawMaterials.push(...materialsToAdd);
    
    await writeDb(data);
    return NextResponse.json(materialsToAdd, { status: 201 });
  } catch(error) {
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     return NextResponse.json({ message: `Gagal mengimpor data: ${errorMessage}` }, { status: 500 });
  }
}
