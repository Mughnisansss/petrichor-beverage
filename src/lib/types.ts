

export interface RawMaterial {
  id: string;
  name: string;
  unit: string; // e.g., gram, ml, pcs
  totalQuantity: number; // The current total stock
  totalCost: number; // The total cost of the current stock (for weighted average calculation)
  costPerUnit: number; // The weighted average cost: totalCost / totalQuantity
  
  // Fields to remember the last purchase unit for quick restock
  lastPurchaseQuantity?: number; 
  lastPurchaseCost?: number;

  category: 'main' | 'packaging' | 'topping';
  sellingPrice?: number; // Optional selling price, mainly for toppings

  // Professional feature: track purchase source
  purchaseSource?: {
    storeName?: string;
    storeAddress?: string;
    purchaseLink?: string;
  }
  
  lowStockThreshold?: number; // Optional threshold for low stock warning
}

export interface Ingredient {
  rawMaterialId: string;
  quantity: number;
}

export interface PackagingInfo {
  id: string;
  name: string;
  additionalPrice: number;
  ingredients: Ingredient[];
}

export interface Drink {
  id:string;
  name:string;
  imageUri?: string;
  subCategory?: string;
  ingredients: Ingredient[]; // Contents
  costPrice: number; // Cost of contents ONLY
  sellingPrice: number; // BASE selling price
  availableToppings?: string[]; // Array of RawMaterial IDs
  packagingOptions?: PackagingInfo[];
}

export interface Food {
  id: string;
  name: string;
  imageUri?: string;
  subCategory?: string;
  ingredients: Ingredient[]; // Contents
  costPrice: number; // Cost of contents ONLY
  sellingPrice: number; // BASE selling price
  availableToppings?: string[]; // Array of RawMaterial IDs
  packagingOptions?: PackagingInfo[];
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
  selectedPackagingId?: string;
  selectedPackagingName?: string;
}

export interface OperationalCost {
  id: string;
  description: string;
  amount: number;
  date: string;
  recurrence: 'sekali' | 'harian' | 'mingguan' | 'bulanan';
}

export interface DbData {
  appName: string;
  logoImageUri: string | null;
  marqueeText: string;
  initialCapital: number;
  cashExpenses: CashExpense[];
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
  sellingPrice: number; // Price for a SINGLE unit, including base product + toppings + packaging.
  selectedToppings: Ingredient[];
  selectedPackagingId?: string;
  selectedPackagingName?: string;
}

export interface QueuedOrder {
  id: string;
  queueNumber: number;
  items: CartItem[];
  createdAt: string;
  status: 'pending' | 'ready';
}

export interface CashExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
}
