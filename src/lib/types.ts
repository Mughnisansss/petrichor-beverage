
export interface RawMaterial {
  id: string;
  name: string;
  unit: string; // e.g., gram, ml, pcs
  totalQuantity: number;
  totalCost: number;
  costPerUnit: number; // Stored for calculation: totalCost / totalQuantity
}

export interface Ingredient {
  rawMaterialId: string;
  quantity: number;
}

export interface Drink {
  id: string;
  name:string;
  ingredients: Ingredient[];
  costPrice: number; // Calculated from ingredients, stored for historical accuracy
  sellingPrice: number;
}

export interface Food {
  id: string;
  name: string;
  ingredients: Ingredient[];
  costPrice: number; // Calculated from ingredients, stored for historical accuracy
  sellingPrice: number;
}

export interface Sale {
  id: string;
  drinkId: string;
  quantity: number;
  discount: number;
  date: string;
}

export interface OperationalCost {
  id: string;
  description: string;
  amount: number;
  date: string;
  recurrence: 'sekali' | 'harian' | 'mingguan' | 'bulanan';
}

export interface DbData {
  drinks: Drink[];
  foods: Food[];
  sales: Sale[];
  operationalCosts: OperationalCost[];
  rawMaterials: RawMaterial[];
}
