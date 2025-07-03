

export interface RawMaterial {
  id: string;
  name: string;
  unit: string; // e.g., gram, ml, pcs
  totalQuantity: number;
  totalCost: number;
  costPerUnit: number; // Stored for calculation: totalCost / totalQuantity
  category: 'main' | 'packaging' | 'topping';
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
  productId: string;
  productType: 'drink' | 'food';
  quantity: number;
  discount: number;
  date: string;
  selectedToppings?: Ingredient[];
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

export interface CartItem {
  cartId: string;
  productId: string;
  productType: 'drink' | 'food';
  name: string;
  quantity: number;
  sellingPrice: number;
  selectedToppings: Ingredient[];
}
