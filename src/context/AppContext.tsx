
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';
import type { Drink, Sale, OperationalCost, RawMaterial, DbData, Food, CartItem, Ingredient } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { 
  isRawMaterialInUse, 
  hasDrinkAssociatedSales,
  hasFoodAssociatedSales,
  recalculateDependentProductCosts 
} from '@/lib/data-logic';

type StorageMode = 'local' | 'server';

// --- API Service (for server/db.json) ---
const apiService = {
  getData: async (): Promise<DbData> => {
    const [drinks, foods, sales, operationalCosts, rawMaterials] = await Promise.all([
      (await fetch('/api/drinks')).json(),
      (await fetch('/api/foods')).json(),
      (await fetch('/api/sales')).json(),
      (await fetch('/api/operasional')).json(),
      (await fetch('/api/bahan-baku')).json(),
    ]);
    return { drinks, foods, sales, operationalCosts, rawMaterials };
  },
  addDrink: async (drink: Omit<Drink, 'id'>): Promise<Drink> => (await fetch('/api/drinks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(drink) })).json(),
  updateDrink: async (id: string, drink: Omit<Drink, 'id'>): Promise<Drink> => (await fetch(`/api/drinks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(drink) })).json(),
  deleteDrink: async (id: string) => {
    const res = await fetch(`/api/drinks/${id}`, { method: 'DELETE' });
    const data = res.ok ? { message: 'Minuman berhasil dihapus.' } : await res.json();
    return { ok: res.ok, message: data.message };
  },
  addFood: async (food: Omit<Food, 'id'>): Promise<Food> => (await fetch('/api/foods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(food) })).json(),
  updateFood: async (id: string, food: Omit<Food, 'id'>): Promise<Food> => (await fetch(`/api/foods/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(food) })).json(),
  deleteFood: async (id: string) => {
    const res = await fetch(`/api/foods/${id}`, { method: 'DELETE' });
    const data = res.ok ? { message: 'Makanan berhasil dihapus.' } : await res.json();
    return { ok: res.ok, message: data.message };
  },
  addSale: async (sale: Omit<Sale, 'id' | 'date'>): Promise<Sale> => (await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sale) })).json(),
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
};

// --- Local Storage Service ---
const LOCAL_STORAGE_KEY = 'sipsavvy_data';

const getLocalData = (): DbData => {
  if (typeof window === 'undefined') {
    return { drinks: [], foods: [], sales: [], operationalCosts: [], rawMaterials: [] };
  }
  const data = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  try {
    const parsedData = data ? JSON.parse(data) : { drinks: [], foods: [], sales: [], operationalCosts: [], rawMaterials: [] };
    // --- Data migrations and defaults ---
    if (parsedData.operationalCosts) {
      parsedData.operationalCosts = parsedData.operationalCosts.map((cost: any) => ({ ...cost, recurrence: cost.recurrence || 'sekali' }));
    } else {
      parsedData.operationalCosts = [];
    }
     if (parsedData.rawMaterials) {
      parsedData.rawMaterials = parsedData.rawMaterials.map((m: any) => ({ ...m, category: m.category || 'main' }));
    } else {
      parsedData.rawMaterials = [];
    }
    parsedData.drinks = parsedData.drinks || [];
    parsedData.foods = parsedData.foods || [];
    parsedData.sales = parsedData.sales || [];
    
    return parsedData;
  } catch {
    return { drinks: [], foods: [], sales: [], operationalCosts: [], rawMaterials: [] };
  }
};

const setLocalData = (data: DbData) => {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

const localStorageService = {
  getData: async (): Promise<DbData> => Promise.resolve(getLocalData()),
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
    const updatedMaterial = { ...data.rawMaterials[index], ...materialUpdate };
    data.rawMaterials[index] = updatedMaterial;
    recalculateDependentProductCosts(data, id);
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

  addDrink: async (drink: Omit<Drink, 'id'>): Promise<Drink> => {
    const data = getLocalData();
    const newDrink = { ...drink, id: nanoid() };
    data.drinks.push(newDrink);
    setLocalData(data);
    return Promise.resolve(newDrink);
  },
  updateDrink: async (id: string, drinkUpdate: Omit<Drink, 'id'>): Promise<Drink> => {
    const data = getLocalData();
    const index = data.drinks.findIndex(d => d.id === id);
    if (index === -1) throw new Error("Drink not found");
    data.drinks[index] = { ...data.drinks[index], ...drinkUpdate, id };
    setLocalData(data);
    return Promise.resolve(data.drinks[index]);
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
  
  addFood: async (food: Omit<Food, 'id'>): Promise<Food> => {
    const data = getLocalData();
    const newFood = { ...food, id: nanoid() };
    if(!data.foods) data.foods = [];
    data.foods.push(newFood);
    setLocalData(data);
    return Promise.resolve(newFood);
  },
  updateFood: async (id: string, foodUpdate: Omit<Food, 'id'>): Promise<Food> => {
    const data = getLocalData();
    const index = data.foods.findIndex(d => d.id === id);
    if (index === -1) throw new Error("Food not found");
    data.foods[index] = { ...data.foods[index], ...foodUpdate, id };
    setLocalData(data);
    return Promise.resolve(data.foods[index]);
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
    const newSale = { ...sale, id: nanoid(), date: new Date().toISOString() };
    data.sales.unshift(newSale);
    setLocalData(data);
    return Promise.resolve(newSale);
  },
  batchAddSales: async (sales: Omit<Sale, 'id' | 'date'>[]): Promise<Sale[]> => {
    const data = getLocalData();
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
};

interface AppContextType {
  drinks: Drink[];
  foods: Food[];
  sales: Sale[];
  operationalCosts: OperationalCost[];
  rawMaterials: RawMaterial[];
  cart: CartItem[];
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
  addDrink: (drink: Omit<Drink, 'id'>) => Promise<Drink>;
  updateDrink: (id: string, drink: Omit<Drink, 'id'>) => Promise<Drink>;
  deleteDrink: (id: string) => Promise<{ ok: boolean, message: string }>;
  addFood: (food: Omit<Food, 'id'>) => Promise<Food>;
  updateFood: (id: string, food: Omit<Food, 'id'>) => Promise<Food>;
  deleteFood: (id: string) => Promise<{ ok: boolean, message: string }>;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<Sale>;
  batchAddSales: (sales: Omit<Sale, 'id' | 'date'>[]) => Promise<Sale[]>;
  addOperationalCost: (cost: Omit<OperationalCost, 'id' | 'date'>) => Promise<OperationalCost>;
  updateOperationalCost: (id: string, cost: Omit<OperationalCost, 'id'|'date'>) => Promise<OperationalCost>;
  deleteOperationalCost: (id: string) => Promise<{ ok: boolean, message: string }>;
  addRawMaterial: (material: Omit<RawMaterial, 'id'>) => Promise<RawMaterial>;
  updateRawMaterial: (id: string, material: Omit<RawMaterial, 'id'>) => Promise<RawMaterial>;
  deleteRawMaterial: (id: string) => Promise<{ ok: boolean, message: string }>;
  addToCart: (product: Drink | Food, type: 'drink' | 'food', selectedToppings: Ingredient[], finalUnitPrice: number) => void;
  updateCartItemQuantity: (cartId: string, quantity: number) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [storageMode, setStorageMode] = useLocalStorage<StorageMode>('sipsavvy_storage_mode', 'local');
  const [appName, setAppName] = useLocalStorage<string>('sipsavvy_appName', 'SipSavvy');
  const [logoImageUri, setLogoImageUri] = useLocalStorage<string | null>('sipsavvy_logoImageUri', null);
  const [marqueeText, setMarqueeText] = useLocalStorage<string>('sipsavvy_marqueeText', 'Selamat Datang di {appName}!');
  const [cart, setCart] = useLocalStorage<CartItem[]>('sipsavvy_cart', []);
  const [dbData, setDbData] = useState<DbData>({ drinks: [], foods: [], sales: [], operationalCosts: [], rawMaterials: [] });
  const [isLoading, setIsLoading] = useState(true);

  const currentService = useMemo(() => {
    return storageMode === 'local' ? localStorageService : apiService;
  }, [storageMode]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await currentService.getData();
      
      // Data migration and setting defaults
      if (data.sales && Array.isArray(data.sales)) {
        data.sales = data.sales.map((sale: any) => {
          if (sale.drinkId && typeof sale.productId === 'undefined') {
            const { drinkId, ...rest } = sale;
            return { ...rest, productId: drinkId, productType: 'drink' };
          }
          return sale;
        });
      }
      if (data.rawMaterials && Array.isArray(data.rawMaterials)) {
        data.rawMaterials = data.rawMaterials.map((m: any) => ({ ...m, category: m.category || 'main' }));
      }

      data.drinks = data.drinks || [];
      data.foods = data.foods || [];
      data.sales = data.sales || [];
      data.operationalCosts = data.operationalCosts || [];
      data.rawMaterials = data.rawMaterials || [];
      data.sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      data.operationalCosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setDbData(data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      setDbData({ drinks: [], foods: [], sales: [], operationalCosts: [], rawMaterials: [] });
    } finally {
      setIsLoading(false);
    }
  }, [currentService]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const addToCart = useCallback((product: Drink | Food, type: 'drink' | 'food', selectedToppings: Ingredient[], finalUnitPrice: number) => {
    setCart(prevCart => {
        const newItem: CartItem = {
            cartId: nanoid(),
            productId: product.id,
            productType: type,
            name: product.name,
            quantity: 1,
            sellingPrice: finalUnitPrice, // Use the calculated price (base + toppings)
            selectedToppings: selectedToppings
        };
        return [...prevCart, newItem];
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

  const wrappedService = useMemo(() => {
    const wrap = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
      return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        const result = await fn(...args);
        await fetchData(); // fetchData is stable thanks to useCallback
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
      batchAddSales: wrap(currentService.batchAddSales),
      addOperationalCost: wrap(currentService.addOperationalCost),
      updateOperationalCost: wrap(currentService.updateOperationalCost),
      deleteOperationalCost: wrap(currentService.deleteOperationalCost),
      addRawMaterial: wrap(currentService.addRawMaterial),
      updateRawMaterial: wrap(currentService.updateRawMaterial),
      deleteRawMaterial: wrap(currentService.deleteRawMaterial),
    }
  }, [currentService, fetchData]);

  const contextValue = useMemo(() => ({
    drinks: dbData.drinks,
    foods: dbData.foods,
    sales: dbData.sales,
    operationalCosts: dbData.operationalCosts,
    rawMaterials: dbData.rawMaterials,
    cart,
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
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
  }), [
    dbData, cart, isLoading, storageMode, setStorageMode, appName, setAppName, 
    logoImageUri, setLogoImageUri, marqueeText, setMarqueeText, fetchData, 
    wrappedService, addToCart, updateCartItemQuantity, removeFromCart, clearCart
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
