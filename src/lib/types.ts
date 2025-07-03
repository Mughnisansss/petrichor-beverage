export interface RawMaterial {
  id: string;
  name: string;
  unit: string; // e.g., gram, ml, pcs
  costPerUnit: number;
}

export interface Ingredient {
  rawMaterialId: string;
  quantity: number;
}

export interface Drink {
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
}
