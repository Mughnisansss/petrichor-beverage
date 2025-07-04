


export interface RawMaterial {
  id: string;
  name: string;
  unit: string; // e.g., gram, ml, pcs
  totalQuantity: number;
  totalCost: number;
  costPerUnit: number; // Stored for calculation: totalCost / totalQuantity
  category: 'main' | 'packaging' | 'topping';
  sellingPrice?: number; // Optional selling price, mainly for toppings
}

export interface Ingredient {
  rawMaterialId: string;
  quantity: number;
}

export interface Drink {
  id: string;
  name:string;
  imageUri?: string;
  ingredients: Ingredient[];
  costPrice: number; // Calculated from ingredients, stored for historical accuracy
  sellingPrice: number;
}

export interface Food {
  id: string;
  name: string;
  imageUri?: string;
  ingredients: Ingredient[];
  costPrice: number; // Calculated from ingredients, stored for historical accuracy
  sellingPrice: number;
}

export interface Sale {
  id: string;
  productId: string;
  productType: 'drink' | 'food';
  quantity: number;
  discount: number; // Stored as percentage, e.g., 10 for 10%
  date: string;
  totalSalePrice: number; // Final price for the line item, after discount. (unitPrice * quantity) * (1 - discount/100)
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
  sellingPrice: number; // Price for a SINGLE unit, including base product + toppings.
  selectedToppings: Ingredient[];
}

export interface QueuedOrder {
  id: string;
  queueNumber: number;
  items: CartItem[];
  createdAt: string;
  status: 'pending' | 'ready';
}

    