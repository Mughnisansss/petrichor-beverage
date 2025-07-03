"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';
import type { Drink, Sale, OperationalCost } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Define the shape of our data operations
interface DataOperations {
  getDrinks: () => Promise<Drink[]>;
  addDrink: (drink: Omit<Drink, 'id'>) => Promise<Drink>;
  updateDrink: (id: string, drink: Omit<Drink, 'id'>) => Promise<Drink>;
  deleteDrink: (id: string) => Promise<{ ok: boolean, message: string }>;
  
  getSales: () => Promise<Sale[]>;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<Sale>;

  getOperationalCosts: () => Promise<OperationalCost[]>;
  addOperationalCost: (cost: Omit<OperationalCost, 'id' | 'date'>) => Promise<OperationalCost>;
  updateOperationalCost: (id: string, cost: Omit<OperationalCost, 'id' | 'date'>) => Promise<OperationalCost>;
  deleteOperationalCost: (id: string) => Promise<{ ok: boolean, message: string }>;
}

// API-based data operations
const apiService: DataOperations = {
  getDrinks: async () => (await fetch('/api/drinks')).json(),
  addDrink: async (drink) => (await fetch('/api/drinks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(drink) })).json(),
  updateDrink: async (id, drink) => (await fetch(`/api/drinks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(drink) })).json(),
  deleteDrink: async (id) => {
    const res = await fetch(`/api/drinks/${id}`, { method: 'DELETE' });
    const data = res.ok ? { message: 'Success' } : await res.json();
    return { ok: res.ok, message: data.message };
  },

  getSales: async () => (await fetch('/api/sales')).json(),
  addSale: async (sale) => (await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sale) })).json(),

  getOperationalCosts: async () => (await fetch('/api/operasional')).json(),
  addOperationalCost: async (cost) => (await fetch('/api/operasional', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cost) })).json(),
  updateOperationalCost: async (id, cost) => (await fetch(`/api/operasional/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cost) })).json(),
  deleteOperationalCost: async (id) => {
    const res = await fetch(`/api/operasional/${id}`, { method: 'DELETE' });
    return { ok: res.ok, message: res.ok ? 'Success' : 'Failed' };
  },
};

// LocalStorage-based data operations
const createLocalStorageService = (): DataOperations => {
    const getDb = () => {
        if (typeof window === 'undefined') {
            return { drinks: [], sales: [], operationalCosts: [] };
        }
        const data = localStorage.getItem('petrichor_db');
        return data ? JSON.parse(data) : { drinks: [], sales: [], operationalCosts: [] };
    };
    const setDb = (data: any) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('petrichor_db', JSON.stringify(data));
        }
    };

    return {
        getDrinks: async () => getDb().drinks,
        addDrink: async (drink) => {
            const db = getDb();
            const newDrink = { ...drink, id: nanoid() };
            db.drinks.push(newDrink);
            setDb(db);
            return newDrink;
        },
        updateDrink: async (id, drinkUpdate) => {
            const db = getDb();
            const index = db.drinks.findIndex((d: Drink) => d.id === id);
            if (index === -1) throw new Error("Drink not found");
            const updatedDrink = { ...db.drinks[index], ...drinkUpdate, id };
            db.drinks[index] = updatedDrink;
            setDb(db);
            return updatedDrink;
        },
        deleteDrink: async (id) => {
            const db = getDb();
            if (db.sales.some((s: Sale) => s.drinkId === id)) {
                return { ok: false, message: 'Minuman tidak dapat dihapus karena memiliki riwayat penjualan.' };
            }
            const initialLength = db.drinks.length;
            db.drinks = db.drinks.filter((d: Drink) => d.id !== id);
            if (db.drinks.length === initialLength) {
                 return { ok: false, message: 'Minuman tidak ditemukan.' };
            }
            setDb(db);
            return { ok: true, message: 'Minuman berhasil dihapus.' };
        },
        getSales: async () => getDb().sales.sort((a: Sale, b: Sale) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        addSale: async (sale) => {
            const db = getDb();
            const newSale = { ...sale, id: nanoid(), date: new Date().toISOString() };
            db.sales.unshift(newSale);
            setDb(db);
            return newSale;
        },
        getOperationalCosts: async () => getDb().operationalCosts.sort((a: OperationalCost, b: OperationalCost) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        addOperationalCost: async (cost) => {
            const db = getDb();
            const newCost = { ...cost, id: nanoid(), date: new Date().toISOString() };
            db.operationalCosts.unshift(newCost);
            setDb(db);
            return newCost;
        },
        updateOperationalCost: async (id, costUpdate) => {
            const db = getDb();
            const index = db.operationalCosts.findIndex((c: OperationalCost) => c.id === id);
            if (index === -1) throw new Error("Cost not found");
            const updatedCost = { ...db.operationalCosts[index], ...costUpdate, id };
            db.operationalCosts[index] = updatedCost;
            setDb(db);
            return updatedCost;
        },
        deleteOperationalCost: async (id) => {
            const db = getDb();
            db.operationalCosts = db.operationalCosts.filter((c: OperationalCost) => c.id !== id);
            setDb(db);
            return { ok: true, message: 'Biaya berhasil dihapus.' };
        },
    };
};

export type StorageMode = "localStorage" | "api";

interface AppContextType extends DataOperations {
  drinks: Drink[];
  sales: Sale[];
  operationalCosts: OperationalCost[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
  storageMode: StorageMode;
  setStorageMode: (mode: StorageMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [operationalCosts, setOperationalCosts] = useState<OperationalCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [storageMode, setStorageMode] = useLocalStorage<StorageMode>('petrichor_storage_mode', 'api');

  const dataService = useMemo(() => {
    if (storageMode === 'localStorage') {
      return createLocalStorageService();
    }
    return apiService;
  }, [storageMode]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [drinksData, salesData, costsData] = await Promise.all([
        dataService.getDrinks(),
        dataService.getSales(),
        dataService.getOperationalCosts()
      ]);
      setDrinks(drinksData);
      setSales(salesData);
      setOperationalCosts(costsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  }, [dataService]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const contextValue = useMemo(() => {
    // Wrap all data modification methods to also trigger a refetch
    const wrapWithRefetch = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
      return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        const result = await fn(...args);
        await fetchData(); // Refetch all data after any modification
        return result;
      };
    };
    
    return {
      drinks,
      sales,
      operationalCosts,
      isLoading,
      fetchData,
      storageMode,
      setStorageMode,
      getDrinks: dataService.getDrinks,
      addDrink: wrapWithRefetch(dataService.addDrink),
      updateDrink: wrapWithRefetch(dataService.updateDrink),
      deleteDrink: wrapWithRefetch(dataService.deleteDrink),
      getSales: dataService.getSales,
      addSale: wrapWithRefetch(dataService.addSale),
      getOperationalCosts: dataService.getOperationalCosts,
      addOperationalCost: wrapWithRefetch(dataService.addOperationalCost),
      updateOperationalCost: wrapWithRefetch(dataService.updateOperationalCost),
      deleteOperationalCost: wrapWithRefetch(dataService.deleteOperationalCost),
    };
  }, [drinks, sales, operationalCosts, isLoading, fetchData, storageMode, setStorageMode, dataService]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
