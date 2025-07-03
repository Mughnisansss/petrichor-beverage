"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';
import type { Drink, Sale, OperationalCost, RawMaterial, DbData } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

type StorageMode = 'local' | 'server';

// --- API Service (for server/db.json) ---
const apiService = {
  // We make these return DbData to have a consistent interface with localStorageService
  getData: async (): Promise<DbData> => {
    const [drinks, sales, operationalCosts, rawMaterials] = await Promise.all([
      (await fetch('/api/drinks')).json(),
      (await fetch('/api/sales')).json(),
      (await fetch('/api/operasional')).json(),
      (await fetch('/api/bahan-baku')).json(),
    ]);
    return { drinks, sales, operationalCosts, rawMaterials };
  },
  addDrink: async (drink: Omit<Drink, 'id'>): Promise<Drink> => (await fetch('/api/drinks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(drink) })).json(),
  updateDrink: async (id: string, drink: Omit<Drink, 'id'>): Promise<Drink> => (await fetch(`/api/drinks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(drink) })).json(),
  deleteDrink: async (id: string) => {
    const res = await fetch(`/api/drinks/${id}`, { method: 'DELETE' });
    const data = res.ok ? { message: 'Minuman berhasil dihapus.' } : await res.json();
    return { ok: res.ok, message: data.message };
  },
  addSale: async (sale: Omit<Sale, 'id' | 'date'>): Promise<Sale> => (await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sale) })).json(),
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
const LOCAL_STORAGE_KEY = 'petrichor_data';

const getLocalData = (): DbData => {
  if (typeof window === 'undefined') {
    return { drinks: [], sales: [], operationalCosts: [], rawMaterials: [] };
  }
  const data = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  try {
    return data ? JSON.parse(data) : { drinks: [], sales: [], operationalCosts: [], rawMaterials: [] };
  } catch {
    return { drinks: [], sales: [], operationalCosts: [], rawMaterials: [] };
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

    // Recalculate cost price for affected drinks
    data.drinks.forEach(drink => {
      if (drink.ingredients.some(i => i.rawMaterialId === id)) {
        drink.costPrice = drink.ingredients.reduce((acc, ing) => {
          const mat = data.rawMaterials.find(m => m.id === ing.rawMaterialId);
          return acc + (mat ? mat.costPerUnit * ing.quantity : 0);
        }, 0);
      }
    });
    
    setLocalData(data);
    return Promise.resolve(updatedMaterial);
  },
  deleteRawMaterial: async (id: string) => {
    const data = getLocalData();
    const isInUse = data.drinks.some(d => d.ingredients.some(i => i.rawMaterialId === id));
    if (isInUse) {
      return Promise.resolve({ ok: false, message: 'Bahan baku tidak dapat dihapus karena digunakan dalam resep minuman.' });
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
    if (data.sales.some(s => s.drinkId === id)) {
      return Promise.resolve({ ok: false, message: 'Minuman tidak dapat dihapus karena memiliki riwayat penjualan.' });
    }
    data.drinks = data.drinks.filter(d => d.id !== id);
    setLocalData(data);
    return Promise.resolve({ ok: true, message: 'Minuman berhasil dihapus.' });
  },

  addSale: async (sale: Omit<Sale, 'id' | 'date'>): Promise<Sale> => {
    const data = getLocalData();
    const newSale = { ...sale, id: nanoid(), date: new Date().toISOString() };
    data.sales.unshift(newSale); // Add to beginning
    setLocalData(data);
    return Promise.resolve(newSale);
  },

  addOperationalCost: async (cost: Omit<OperationalCost, 'id' | 'date'>): Promise<OperationalCost> => {
    const data = getLocalData();
    const newCost = { ...cost, id: nanoid(), date: new Date().toISOString() };
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
  sales: Sale[];
  operationalCosts: OperationalCost[];
  rawMaterials: RawMaterial[];
  isLoading: boolean;
  storageMode: StorageMode;
  setStorageMode: (mode: StorageMode) => void;
  fetchData: () => Promise<void>;
  addDrink: (drink: Omit<Drink, 'id'>) => Promise<Drink>;
  updateDrink: (id: string, drink: Omit<Drink, 'id'>) => Promise<Drink>;
  deleteDrink: (id: string) => Promise<{ ok: boolean, message: string }>;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<Sale>;
  addOperationalCost: (cost: Omit<OperationalCost, 'id' | 'date'>) => Promise<OperationalCost>;
  updateOperationalCost: (id: string, cost: Omit<OperationalCost, 'id'|'date'>) => Promise<OperationalCost>;
  deleteOperationalCost: (id: string) => Promise<{ ok: boolean, message: string }>;
  addRawMaterial: (material: Omit<RawMaterial, 'id'>) => Promise<RawMaterial>;
  updateRawMaterial: (id: string, material: Omit<RawMaterial, 'id'>) => Promise<RawMaterial>;
  deleteRawMaterial: (id: string) => Promise<{ ok: boolean, message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [storageMode, setStorageMode] = useLocalStorage<StorageMode>('petrichor_storage_mode', 'local');
  const [dbData, setDbData] = useState<DbData>({ drinks: [], sales: [], operationalCosts: [], rawMaterials: [] });
  const [isLoading, setIsLoading] = useState(true);

  const currentService = useMemo(() => {
    return storageMode === 'local' ? localStorageService : apiService;
  }, [storageMode]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await currentService.getData();
      // Ensure sales and costs are sorted descending by date
      data.sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      data.operationalCosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setDbData(data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      setDbData({ drinks: [], sales: [], operationalCosts: [], rawMaterials: [] });
    } finally {
      setIsLoading(false);
    }
  }, [currentService]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const contextValue = useMemo(() => {
    const wrapWithRefetch = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
      return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        const result = await fn(...args);
        await fetchData(); // Refetch all data after any modification
        return result;
      };
    };
    
    return {
      drinks: dbData.drinks,
      sales: dbData.sales,
      operationalCosts: dbData.operationalCosts,
      rawMaterials: dbData.rawMaterials,
      isLoading,
      fetchData,
      storageMode,
      setStorageMode,
      addDrink: wrapWithRefetch(currentService.addDrink),
      updateDrink: wrapWithRefetch(currentService.updateDrink),
      deleteDrink: wrapWithRefetch(currentService.deleteDrink),
      addSale: wrapWithRefetch(currentService.addSale),
      addOperationalCost: wrapWithRefetch(currentService.addOperationalCost),
      updateOperationalCost: wrapWithRefetch(currentService.updateOperationalCost),
      deleteOperationalCost: wrapWithRefetch(currentService.deleteOperationalCost),
      addRawMaterial: wrapWithRefetch(currentService.addRawMaterial),
      updateRawMaterial: wrapWithRefetch(currentService.updateRawMaterial),
      deleteRawMaterial: wrapWithRefetch(currentService.deleteRawMaterial),
    };
  }, [dbData, isLoading, fetchData, storageMode, setStorageMode, currentService]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
