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
