export interface Drink {
  id: string;
  name: string;
  costPrice: number;
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
