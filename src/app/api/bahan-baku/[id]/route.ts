import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { RawMaterial, Drink, Food } from '@/lib/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const updatedMaterialData: Omit<RawMaterial, 'id'> = await request.json();
  const data = await readDb();

  if (!data.rawMaterials) {
     return NextResponse.json({ message: 'Raw material storage not found' }, { status: 500 });
  }
  
  const materialIndex = data.rawMaterials.findIndex(m => m.id === id);
  if (materialIndex === -1) {
    return NextResponse.json({ message: 'Raw material not found' }, { status: 404 });
  }

  const updatedMaterial: RawMaterial = { ...data.rawMaterials[materialIndex], ...updatedMaterialData, id };
  data.rawMaterials[materialIndex] = updatedMaterial;

  // Find drinks that use this material and update their costPrice
  data.drinks.forEach((drink: Drink) => {
    const usesMaterial = drink.ingredients.some(ing => ing.rawMaterialId === id);
    if (usesMaterial) {
      let newCostPrice = 0;
      drink.ingredients.forEach(ing => {
        const material = data.rawMaterials.find(m => m.id === ing.rawMaterialId);
        if (material) {
          newCostPrice += material.costPerUnit * ing.quantity;
        }
      });
      drink.costPrice = newCostPrice;
    }
  });
  
  // Find foods that use this material and update their costPrice
  if (data.foods) {
    data.foods.forEach((food: Food) => {
        const usesMaterial = food.ingredients.some(ing => ing.rawMaterialId === id);
        if (usesMaterial) {
            let newCostPrice = 0;
            food.ingredients.forEach(ing => {
                const material = data.rawMaterials.find(m => m.id === ing.rawMaterialId);
                if (material) {
                    newCostPrice += material.costPerUnit * ing.quantity;
                }
            });
            food.costPrice = newCostPrice;
        }
    });
  }

  await writeDb(data);
  return NextResponse.json(updatedMaterial);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const data = await readDb();

  if (!data.rawMaterials) {
     return NextResponse.json({ message: 'Raw material storage not found' }, { status: 500 });
  }

  // Check if any drink or food uses this raw material
  const isUsedInDrink = data.drinks.some((drink: Drink) => 
    drink.ingredients.some(ingredient => ingredient.rawMaterialId === id)
  );

  const isUsedInFood = data.foods && data.foods.some((food: Food) => 
    food.ingredients.some(ingredient => ingredient.rawMaterialId === id)
  );

  if (isUsedInDrink || isUsedInFood) {
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
