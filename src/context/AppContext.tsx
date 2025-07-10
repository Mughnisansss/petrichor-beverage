

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';
import type { Drink, Sale, OperationalCost, RawMaterial, DbData, Food, CartItem, Ingredient, QueuedOrder, PackagingInfo } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { 
  isRawMaterialInUse, 
  hasDrinkAssociatedSales,
  hasFoodAssociatedSales,
  recalculateDependentProductCosts,
  deductStockForSaleItems,
  calculateItemCostPrice,
} from '@/lib/data-logic';

type StorageMode = 'local' | 'server';

// --- API Service (for server/db.json) ---
const apiService = {
  getData: async (): Promise<DbData> => {
    const res = await fetch('/api/get-all-data');
    if (!res.ok) throw new Error('Failed to fetch data from server');
    return res.json();
  },
  importData: async (data: DbData): Promise<{ ok: boolean, message: string }> => {
    const res = await fetch('/api/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const responseData = await res.json();
    return { ok: res.ok, message: responseData.message };
  },
  addDrink: async (drink: Omit<Drink, 'id' | 'costPrice'>): Promise<Drink> => (await fetch('/api/drinks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(drink) })).json(),
  updateDrink: async (id: string, drink: Partial<Omit<Drink, 'id'>>): Promise<Drink> => (await fetch(`/api/drinks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(drink) })).json(),
  deleteDrink: async (id: string) => {
    const res = await fetch(`/api/drinks/${id}`, { method: 'DELETE' });
    const data = res.ok ? { message: 'Minuman berhasil dihapus.' } : await res.json();
    return { ok: res.ok, message: data.message };
  },
  addFood: async (food: Omit<Food, 'id' | 'costPrice'>): Promise<Food> => (await fetch('/api/foods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(food) })).json(),
  updateFood: async (id: string, food: Partial<Omit<Food, 'id'>>): Promise<Food> => (await fetch(`/api/foods/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(food) })).json(),
  deleteFood: async (id: string) => {
    const res = await fetch(`/api/foods/${id}`, { method: 'DELETE' });
    const data = res.ok ? { message: 'Makanan berhasil dihapus.' } : await res.json();
    return { ok: res.ok, message: data.message };
  },
  addSale: async (sale: Omit<Sale, 'id' | 'date'>): Promise<Sale> => (await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sale) })).json(),
  deleteSale: async (id: string) => {
    const res = await fetch(`/api/sales/${id}`, { method: 'DELETE' });
    const data = res.ok ? { message: 'Penjualan berhasil dihapus.' } : await res.json();
    return { ok: res.ok, message: data.message };
  },
  batchAddSales: async (sales: Omit<Sale, 'id' | 'date'>[]): Promise<Sale[]> => (await fetch('/api/sales/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sales) })).json(),
  addOperationalCost: async (cost: Omit<OperationalCost, 'id' | 'date'>): Promise<OperationalCost> => (await fetch('/api/operasional', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cost) })).json(),
  updateOperationalCost: async (id: string, cost: Omit<OperationalCost, 'id' | 'date'>): Promise<OperationalCost> => (await fetch(`/api/operasional/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cost) })).json(),
  deleteOperationalCost: async (id: string) => {
    const res = await fetch(`/api/operasional/${id}`, { method: 'DELETE' });
    return { ok: res.ok, message: res.ok ? 'Biaya berhasil dihapus.' : 'Gagal menghapus biaya.' };
  },
  addRawMaterial: async (material: Omit<RawMaterial, 'id'>): Promise<RawMaterial> => (await fetch('/api/bahan-baku', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(material) })).json(),
  updateRawMaterial: async (id: string, material: Omit<RawMaterial, 'id'>): Promise<RawMaterial> => (await fetch(`/api/bahan-baku/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(material) })).json(),
  deleteRawMaterial: async (id: string) => {
    const res = await fetch(`/api/bahan-baku/${id}`, { method: 'DELETE' });
    const data = res.ok ? { message: 'Bahan baku berhasil dihapus.' } : await res.json();
    return { ok: res.ok, message: data.message };
  },
  importRawMaterialsFromCsv: async (materials: Omit<RawMaterial, 'id'>[]): Promise<RawMaterial[]> => (await fetch('/api/bahan-baku/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(materials) })).json(),
  importOperationalCostsFromCsv: async (costs: Omit<OperationalCost, 'id'>[]): Promise<OperationalCost[]> => (await fetch('/api/operasional/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(costs) })).json(),
};

// --- Local Storage Service ---
const LOCAL_STORAGE_KEY = 'petrichor_data';

const getLocalData = (): DbData => {
  if (typeof window === 'undefined') {
    return { appName: 'Petrichor', logoImageUri: null, marqueeText: 'Welcome!', drinks: [], foods: [], sales: [], operationalCosts: [], rawMaterials: [] };
  }
  const data = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  try {
    const parsedData = data ? JSON.parse(data) : {};
    
    // --- Data migrations and defaults ---
    parsedData.operationalCosts = (parsedData.operationalCosts || []).map((cost: any) => ({ ...cost, recurrence: cost.recurrence || 'sekali' }));
    parsedData.rawMaterials = (parsedData.rawMaterials || []).map((m: any) => ({ ...m, category: m.category || 'main' }));
    parsedData.drinks = parsedData.drinks || [];
    parsedData.foods = parsedData.foods || [];
    parsedData.sales = parsedData.sales || [];
    
    return parsedData as DbData;
  } catch {
    return { appName: 'Petrichor', logoImageUri: null, marqueeText: 'Welcome!', drinks: [], foods: [], sales: [], operationalCosts: [], rawMaterials: [] };
  }
};

const setLocalData = (data: DbData) => {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

const localStorageService = {
  getData: async (): Promise<DbData> => Promise.resolve(getLocalData()),
  importData: async (data: DbData): Promise<{ ok: boolean, message: string }> => {
    if (!data || !Array.isArray(data.drinks) || !Array.isArray(data.foods) || !Array.isArray(data.sales) || !Array.isArray(data.operationalCosts) || !Array.isArray(data.rawMaterials)) {
      return Promise.resolve({ ok: false, message: 'Data JSON tidak valid atau formatnya salah.' });
    }
    setLocalData(data);
    return Promise.resolve({ ok: true, message: 'Data berhasil diimpor.' });
  },
  addRawMaterial: async (material: Omit<RawMaterial, 'id'>): Promise<RawMaterial> => {
    const data = getLocalData();
    const newMaterial = { ...material, id: nanoid() };
    data.rawMaterials.push(newMaterial);
    setLocalData(data);
    return Promise.resolve(newMaterial);
  },
  updateRawMaterial: async (id: string, materialUpdate: Omit<RawMaterial, 'id'>): Promise<RawMaterial> => {
    const data = getLocalData();
    const index = data.rawMaterials.findIndex(m => m.id === id);
    if (index === -1) throw new Error("Material not found");

    const oldCostPerUnit = data.rawMaterials[index].costPerUnit;
    
    const updatedMaterial = { ...data.rawMaterials[index], ...materialUpdate, id };
    data.rawMaterials[index] = updatedMaterial;

    if (updatedMaterial.costPerUnit !== oldCostPerUnit) {
      recalculateDependentProductCosts(data, id);
    }
    
    setLocalData(data);
    return Promise.resolve(updatedMaterial);
  },
  deleteRawMaterial: async (id: string) => {
    const data = getLocalData();
    if (isRawMaterialInUse(data, id)) {
      return Promise.resolve({ ok: false, message: 'Bahan baku tidak dapat dihapus karena digunakan dalam resep.' });
    }
    data.rawMaterials = data.rawMaterials.filter(m => m.id !== id);
    setLocalData(data);
    return Promise.resolve({ ok: true, message: 'Bahan baku berhasil dihapus.' });
  },
  addDrink: async (drinkData: Omit<Drink, 'id' | 'costPrice'>): Promise<Drink> => {
    const data = getLocalData();
    const costPrice = calculateItemCostPrice(drinkData.ingredients, data.rawMaterials);
    const newDrink = { ...drinkData, id: nanoid(), costPrice };
    data.drinks.push(newDrink);
    setLocalData(data);
    return Promise.resolve(newDrink);
  },
  updateDrink: async (id: string, drinkUpdate: Partial<Omit<Drink, 'id'>>): Promise<Drink> => {
    const data = getLocalData();
    const index = data.drinks.findIndex(d => d.id === id);
    if (index === -1) throw new Error("Drink not found");
    
    if (drinkUpdate.ingredients) {
        drinkUpdate.costPrice = calculateItemCostPrice(drinkUpdate.ingredients, data.rawMaterials);
    }
    
    const updatedDrink = { ...data.drinks[index], ...drinkUpdate, id };
    data.drinks[index] = updatedDrink;
    setLocalData(data);
    return Promise.resolve(updatedDrink);
  },
  deleteDrink: async (id: string) => {
    const data = getLocalData();
    if (hasDrinkAssociatedSales(data, id)) {
      return Promise.resolve({ ok: false, message: 'Minuman tidak dapat dihapus karena memiliki riwayat penjualan.' });
    }
    data.drinks = data.drinks.filter(d => d.id !== id);
    setLocalData(data);
    return Promise.resolve({ ok: true, message: 'Minuman berhasil dihapus.' });
  },
  addFood: async (foodData: Omit<Food, 'id' | 'costPrice'>): Promise<Food> => {
    const data = getLocalData();
    if(!data.foods) data.foods = [];
    const costPrice = calculateItemCostPrice(foodData.ingredients, data.rawMaterials);
    const newFood = { ...foodData, id: nanoid(), costPrice };
    data.foods.push(newFood);
    setLocalData(data);
    return Promise.resolve(newFood);
  },
  updateFood: async (id: string, foodUpdate: Partial<Omit<Food, 'id'>>): Promise<Food> => {
    const data = getLocalData();
    const index = data.foods.findIndex(d => d.id === id);
    if (index === -1) throw new Error("Food not found");

    if (foodUpdate.ingredients) {
        foodUpdate.costPrice = calculateItemCostPrice(foodUpdate.ingredients, data.rawMaterials);
    }

    const updatedFood = { ...data.foods[index], ...foodUpdate, id };
    data.foods[index] = updatedFood;
    setLocalData(data);
    return Promise.resolve(updatedFood);
  },
  deleteFood: async (id: string) => {
    const data = getLocalData();
    if (hasFoodAssociatedSales(data, id)) {
      return Promise.resolve({ ok: false, message: 'Makanan tidak dapat dihapus karena memiliki riwayat penjualan.' });
    }
    data.foods = data.foods.filter(d => d.id !== id);
    setLocalData(data);
    return Promise.resolve({ ok: true, message: 'Makanan berhasil dihapus.' });
  },
  addSale: async (sale: Omit<Sale, 'id' | 'date'>): Promise<Sale> => {
    const data = getLocalData();
    deductStockForSaleItems([sale], data);
    const newSale = { ...sale, id: nanoid(), date: new Date().toISOString() };
    data.sales.unshift(newSale);
    setLocalData(data);
    return Promise.resolve(newSale);
  },
  deleteSale: async (id: string) => {
    const data = getLocalData();
    data.sales = data.sales.filter(s => s.id !== id);
    setLocalData(data);
    return Promise.resolve({ ok: true, message: 'Penjualan berhasil dihapus.' });
  },
  batchAddSales: async (sales: Omit<Sale, 'id' | 'date'>[]): Promise<Sale[]> => {
    const data = getLocalData();
    deductStockForSaleItems(sales, data);
    const newSales = sales.map(s => ({ ...s, id: nanoid(), date: new Date().toISOString() }));
    data.sales.unshift(...newSales);
    data.sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setLocalData(data);
    return Promise.resolve(newSales);
  },
  addOperationalCost: async (cost: Omit<OperationalCost, 'id' | 'date'>): Promise<OperationalCost> => {
    const data = getLocalData();
    const newCost = { ...cost, id: nanoid(), date: new Date().toISOString() };
    if(!data.operationalCosts) data.operationalCosts = [];
    data.operationalCosts.unshift(newCost);
    setLocalData(data);
    return Promise.resolve(newCost);
  },
  updateOperationalCost: async (id: string, costUpdate: Omit<OperationalCost, 'id' | 'date'>): Promise<OperationalCost> => {
    const data = getLocalData();
    const index = data.operationalCosts.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Cost not found");
    data.operationalCosts[index] = { ...data.operationalCosts[index], ...costUpdate, id };
    setLocalData(data);
    return Promise.resolve(data.operationalCosts[index]);
  },
  deleteOperationalCost: async (id: string) => {
    const data = getLocalData();
    data.operationalCosts = data.operationalCosts.filter(c => c.id !== id);
    setLocalData(data);
    return Promise.resolve({ ok: true, message: 'Biaya berhasil dihapus.' });
  },
  importRawMaterialsFromCsv: async (materials: Omit<RawMaterial, 'id'>[]): Promise<RawMaterial[]> => {
    const data = getLocalData();
    if (!data.rawMaterials) data.rawMaterials = [];

    const materialsToAdd: RawMaterial[] = materials.map(mat => {
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
    setLocalData(data);
    return Promise.resolve(materialsToAdd);
  },
  importOperationalCostsFromCsv: async (costs: Omit<OperationalCost, 'id'>[]): Promise<OperationalCost[]> => {
    const data = getLocalData();
    if (!data.operationalCosts) data.operationalCosts = [];

    const costsToAdd: OperationalCost[] = costs.map(cost => ({
      id: nanoid(),
      description: cost.description || 'Tanpa Deskripsi',
      amount: Number(cost.amount) || 0,
      date: cost.date || new Date().toISOString(),
      recurrence: cost.recurrence || 'sekali',
    }));

    data.operationalCosts.unshift(...costsToAdd);
    data.operationalCosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setLocalData(data);
    return Promise.resolve(costsToAdd);
  },
};

interface AppContextType {
  drinks: Drink[];
  foods: Food[];
  sales: Sale[];
  operationalCosts: OperationalCost[];
  rawMaterials: RawMaterial[];
  cart: CartItem[];
  orderQueue: QueuedOrder[];
  isLoading: boolean;
  storageMode: StorageMode;
  setStorageMode: (mode: StorageMode) => void;
  appName: string;
  setAppName: (name: string) => void;
  logoImageUri: string | null;
  setLogoImageUri: (uri: string | null) => void;
  marqueeText: string;
  setMarqueeText: (text: string) => void;
  fetchData: () => Promise<void>;
  importData: (data: DbData) => Promise<{ ok: boolean, message: string }>;
  addDrink: (drink: Omit<Drink, 'id' | 'costPrice'>) => Promise<Drink>;
  updateDrink: (id: string, drink: Partial<Omit<Drink, 'id'>>) => Promise<Drink>;
  deleteDrink: (id: string) => Promise<{ ok: boolean, message: string }>;
  addFood: (food: Omit<Food, 'id' | 'costPrice'>) => Promise<Food>;
  updateFood: (id: string, food: Partial<Omit<Food, 'id'>>) => Promise<Food>;
  deleteFood: (id: string) => Promise<{ ok: boolean, message: string }>;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<Sale>;
  deleteSale: (id: string) => Promise<{ ok: boolean; message: string }>;
  batchAddSales: (sales: Omit<Sale, 'id' | 'date'>[]) => Promise<Sale[]>;
  addOperationalCost: (cost: Omit<OperationalCost, 'id' | 'date'>) => Promise<OperationalCost>;
  updateOperationalCost: (id: string, cost: Omit<OperationalCost, 'id'|'date'>) => Promise<OperationalCost>;
  deleteOperationalCost: (id: string) => Promise<{ ok: boolean, message: string }>;
  addRawMaterial: (material: Omit<RawMaterial, 'id'>) => Promise<RawMaterial>;
  updateRawMaterial: (id: string, material: Omit<RawMaterial, 'id'>) => Promise<RawMaterial>;
  deleteRawMaterial: (id: string) => Promise<{ ok: boolean, message: string }>;
  addToCart: (product: Drink | Food, type: 'drink' | 'food', quantity: number, selectedToppings: Ingredient[], selectedPackaging: PackagingInfo | undefined, finalUnitPrice: number) => void;
  updateCartItemQuantity: (cartId: string, quantity: number) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  submitCustomerOrder: () => Promise<number>;
  updateQueuedOrderStatus: (orderId: string, status: 'pending' | 'ready') => Promise<void>;
  processQueuedOrder: (orderId: string) => Promise<void>;
  importRawMaterialsFromCsv: (materials: Omit<RawMaterial, 'id'>[]) => Promise<RawMaterial[]>;
  importOperationalCostsFromCsv: (costs: Omit<OperationalCost, 'id'>[]) => Promise<OperationalCost[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [storageMode, setStorageMode] = useLocalStorage<StorageMode>('petrichor_storage_mode', 'local');
  const [appName, setAppName] = useLocalStorage<string>('petrichor_appName', 'Petrichor');
  const [logoImageUri, setLogoImageUri] = useLocalStorage<string | null>('petrichor_logoImageUri', null);
  const [marqueeText, setMarqueeText] = useLocalStorage<string>('petrichor_marqueeText', 'Selamat Datang di {appName}!');
  const [cart, setCart] = useLocalStorage<CartItem[]>('petrichor_customer_cart', []);
  const [orderQueue, setOrderQueue] = useLocalStorage<QueuedOrder[]>('petrichor_order_queue', []);
  const [lastQueueNumber, setLastQueueNumber] = useLocalStorage<number>('petrichor_last_queue_number', 0);
  const [dbData, setDbData] = useState<DbData>({ appName: 'Petrichor', logoImageUri: null, marqueeText: '', drinks: [], foods: [], sales: [], operationalCosts: [], rawMaterials: [] });
  const [isLoading, setIsLoading] = useState(true);

  const currentService = useMemo(() => {
    return storageMode === 'local' ? localStorageService : apiService;
  }, [storageMode]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await currentService.getData();
      
      const { appName, logoImageUri, marqueeText, ...restOfDbData } = data;

      if (appName) setAppName(appName);
      if (logoImageUri !== undefined) setLogoImageUri(logoImageUri);
      if (marqueeText) setMarqueeText(marqueeText);

      // --- Data Migrations ---
      if (restOfDbData.drinks && Array.isArray(restOfDbData.drinks)) {
        restOfDbData.drinks = restOfDbData.drinks.map((drink: any) => {
          if (drink.temperature && !drink.subCategory) {
            drink.subCategory = drink.temperature === 'hot' ? 'Panas' : 'Dingin';
            delete drink.temperature;
          }
          return drink;
        });
      }

      if (restOfDbData.sales && Array.isArray(restOfDbData.sales)) {
        restOfDbData.sales = restOfDbData.sales.map((sale: any) => {
          if (sale.drinkId && typeof sale.productId === 'undefined') {
            const { drinkId, ...rest } = sale;
            return { ...rest, productId: drinkId, productType: 'drink' };
          }
          return sale;
        });
      }
      if (restOfDbData.rawMaterials && Array.isArray(restOfDbData.rawMaterials)) {
        restOfDbData.rawMaterials = restOfDbData.rawMaterials.map((m: any) => ({ ...m, category: m.category || 'main' }));
      }
      
      restOfDbData.drinks = restOfDbData.drinks || [];
      restOfDbData.foods = restOfDbData.foods || [];
      restOfDbData.sales = (restOfDbData.sales || []).sort((a: Sale, b: Sale) => new Date(b.date).getTime() - new Date(a.date).getTime());
      restOfDbData.operationalCosts = (restOfDbData.operationalCosts || []).sort((a: OperationalCost, b: OperationalCost) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setDbData(restOfDbData);

    } catch (error) {
      console.error("Failed to fetch data", error);
      setDbData({ appName: 'Petrichor', logoImageUri: null, marqueeText: '', drinks: [], foods: [], sales: [], operationalCosts: [], rawMaterials: [] });
    } finally {
        setIsLoading(false);
    }
  }, [currentService, setAppName, setLogoImageUri, setMarqueeText]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const addToCart = useCallback((product: Drink | Food, type: 'drink' | 'food', quantity: number, selectedToppings: Ingredient[], selectedPackaging: PackagingInfo | undefined, finalUnitPrice: number) => {
    setCart(prevCart => {
      const stringifiedToppings = JSON.stringify(selectedToppings.map(t => t.rawMaterialId).sort());
      
      const existingItemIndex = prevCart.findIndex(item => 
        item.productId === product.id &&
        item.selectedPackagingId === (selectedPackaging?.id || undefined) &&
        JSON.stringify(item.selectedToppings.map(t => t.rawMaterialId).sort()) === stringifiedToppings
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        const newItem: CartItem = {
            cartId: nanoid(),
            productId: product.id,
            productType: type,
            name: product.name,
            quantity: quantity,
            sellingPrice: finalUnitPrice,
            selectedToppings: selectedToppings,
            selectedPackagingId: selectedPackaging?.id,
            selectedPackagingName: selectedPackaging?.name,
        };
        return [...prevCart, newItem];
      }
    });
  }, [setCart]);

  const updateCartItemQuantity = useCallback((cartId: string, quantity: number) => {
    setCart(prevCart => {
        if (quantity <= 0) {
            return prevCart.filter(item => item.cartId !== cartId);
        }
        return prevCart.map(item => 
            item.cartId === cartId 
            ? { ...item, quantity }
            : item
        );
    });
  }, [setCart]);

  const removeFromCart = useCallback((cartId: string) => {
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
  }, [setCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, [setCart]);

  const submitCustomerOrder = useCallback(async (): Promise<number> => {
    if (cart.length === 0) {
      throw new Error("Cart is empty");
    }
    const newQueueNumber = lastQueueNumber + 1;
    const newOrder: QueuedOrder = {
      id: nanoid(),
      queueNumber: newQueueNumber,
      items: cart,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setOrderQueue(prevQueue => [...prevQueue, newOrder]);
    setLastQueueNumber(newQueueNumber);
    clearCart();
    return newQueueNumber;
  }, [cart, lastQueueNumber, setOrderQueue, setLastQueueNumber, clearCart]);

  const updateQueuedOrderStatus = useCallback(async (orderId: string, status: 'pending' | 'ready'): Promise<void> => {
    setOrderQueue(prevQueue => prevQueue.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  }, [setOrderQueue]);

  const processQueuedOrder = useCallback(async (orderId: string): Promise<void> => {
    const orderToProcess = orderQueue.find(o => o.id === orderId);
    if (!orderToProcess) {
      throw new Error("Order not found in queue");
    }

    const salesPayload = orderToProcess.items.map(item => {
      const totalSalePrice = item.sellingPrice * item.quantity;
      return {
        productId: item.productId,
        productType: item.productType,
        quantity: item.quantity,
        discount: 0,
        selectedToppings: item.selectedToppings,
        totalSalePrice: totalSalePrice,
        selectedPackagingId: item.selectedPackagingId,
        selectedPackagingName: item.selectedPackagingName,
      };
    });
    
    await currentService.batchAddSales(salesPayload);
    await fetchData();

    setOrderQueue(prevQueue => prevQueue.filter(o => o.id !== orderId));
  }, [orderQueue, currentService, setOrderQueue, fetchData]);

  const importData = useCallback(async (data: any): Promise<{ ok: boolean, message: string }> => {
    const { appName, logoImageUri, marqueeText, ...dbDataToImport } = data;
    const result = await currentService.importData(dbDataToImport);
    if (result.ok) {
      if (appName) setAppName(appName);
      if (logoImageUri !== undefined) setLogoImageUri(logoImageUri);
      if (marqueeText) setMarqueeText(marqueeText);
      setDbData(dbDataToImport);
    }
    return result;
  }, [currentService, setAppName, setLogoImageUri, setMarqueeText]);

  const wrappedService = useMemo(() => {
    const wrap = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
      return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        const result = await fn(...args);
        await fetchData();
        return result;
      };
    };

    return {
      addDrink: wrap(currentService.addDrink),
      updateDrink: wrap(currentService.updateDrink),
      deleteDrink: wrap(currentService.deleteDrink),
      addFood: wrap(currentService.addFood),
      updateFood: wrap(currentService.updateFood),
      deleteFood: wrap(currentService.deleteFood),
      addSale: wrap(currentService.addSale),
      deleteSale: wrap(currentService.deleteSale),
      batchAddSales: wrap(currentService.batchAddSales),
      addOperationalCost: wrap(currentService.addOperationalCost),
      updateOperationalCost: wrap(currentService.updateOperationalCost),
      deleteOperationalCost: wrap(currentService.deleteOperationalCost),
      addRawMaterial: wrap(currentService.addRawMaterial),
      updateRawMaterial: wrap(currentService.updateRawMaterial),
      deleteRawMaterial: wrap(currentService.deleteRawMaterial),
      importRawMaterialsFromCsv: wrap(currentService.importRawMaterialsFromCsv),
      importOperationalCostsFromCsv: wrap(currentService.importOperationalCostsFromCsv),
    }
  }, [currentService, fetchData]);


  const contextValue = useMemo(() => ({
    drinks: dbData.drinks,
    foods: dbData.foods,
    sales: dbData.sales,
    operationalCosts: dbData.operationalCosts,
    rawMaterials: dbData.rawMaterials,
    cart,
    orderQueue,
    isLoading,
    storageMode,
    setStorageMode,
    appName,
    setAppName,
    logoImageUri,
    setLogoImageUri,
    marqueeText,
    setMarqueeText,
    fetchData,
    ...wrappedService,
    importData,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    submitCustomerOrder,
    updateQueuedOrderStatus,
    processQueuedOrder,
  }), [
    dbData, cart, orderQueue, isLoading, storageMode, setStorageMode, appName, setAppName, 
    logoImageUri, setLogoImageUri, marqueeText, setMarqueeText, fetchData, 
    wrappedService, importData, addToCart, updateCartItemQuantity, removeFromCart, clearCart,
    submitCustomerOrder, updateQueuedOrderStatus, processQueuedOrder,
  ]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
