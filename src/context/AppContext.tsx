"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Drink, Sale, OperationalCost, RawMaterial } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

// API-based data operations
const apiService = {
  getDrinks: async (): Promise<Drink[]> => (await fetch('/api/drinks')).json(),
  addDrink: async (drink: Omit<Drink, 'id'>): Promise<Drink> => (await fetch('/api/drinks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(drink) })).json(),
  updateDrink: async (id: string, drink: Omit<Drink, 'id'>): Promise<Drink> => (await fetch(`/api/drinks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(drink) })).json(),
  deleteDrink: async (id: string) => {
    const res = await fetch(`/api/drinks/${id}`, { method: 'DELETE' });
    const data = res.ok ? { message: 'Minuman berhasil dihapus.' } : await res.json();
    return { ok: res.ok, message: data.message };
  },

  getSales: async (): Promise<Sale[]> => (await fetch('/api/sales')).json(),
  addSale: async (sale: Omit<Sale, 'id' | 'date'>): Promise<Sale> => (await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sale) })).json(),

  getOperationalCosts: async (): Promise<OperationalCost[]> => (await fetch('/api/operasional')).json(),
  addOperationalCost: async (cost: Omit<OperationalCost, 'id' | 'date'>): Promise<OperationalCost> => (await fetch('/api/operasional', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cost) })).json(),
  updateOperationalCost: async (id: string, cost: Omit<OperationalCost, 'id' | 'date'>): Promise<OperationalCost> => (await fetch(`/api/operasional/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cost) })).json(),
  deleteOperationalCost: async (id: string) => {
    const res = await fetch(`/api/operasional/${id}`, { method: 'DELETE' });
    return { ok: res.ok, message: res.ok ? 'Biaya berhasil dihapus.' : 'Gagal menghapus biaya.' };
  },

  getRawMaterials: async (): Promise<RawMaterial[]> => (await fetch('/api/bahan-baku')).json(),
  addRawMaterial: async (material: Omit<RawMaterial, 'id'>): Promise<RawMaterial> => (await fetch('/api/bahan-baku', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(material) })).json(),
  updateRawMaterial: async (id: string, material: Omit<RawMaterial, 'id'>): Promise<RawMaterial> => (await fetch(`/api/bahan-baku/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(material) })).json(),
  deleteRawMaterial: async (id: string) => {
    const res = await fetch(`/api/bahan-baku/${id}`, { method: 'DELETE' });
    const data = res.ok ? { message: 'Bahan baku berhasil dihapus.' } : await res.json();
    return { ok: res.ok, message: data.message };
  },
};


interface AppContextType {
  drinks: Drink[];
  sales: Sale[];
  operationalCosts: OperationalCost[];
  rawMaterials: RawMaterial[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
  
  addDrink: (drink: Omit<Drink, 'id'>) => Promise<Drink>;
  updateDrink: (id: string, drink: Omit<Drink, 'id'>) => Promise<Drink>;
  deleteDrink: (id: string) => Promise<{ ok: boolean, message: string }>;
  
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<Sale>;

  addOperationalCost: (cost: Omit<OperationalCost, 'id' | 'date'>) => Promise<OperationalCost>;
  updateOperationalCost: (id: string, cost: Omit<OperationalCost, 'id' | 'date'>) => Promise<OperationalCost>;
  deleteOperationalCost: (id: string) => Promise<{ ok: boolean, message: string }>;

  addRawMaterial: (material: Omit<RawMaterial, 'id'>) => Promise<RawMaterial>;
  updateRawMaterial: (id: string, material: Omit<RawMaterial, 'id'>) => Promise<RawMaterial>;
  deleteRawMaterial: (id: string) => Promise<{ ok: boolean, message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [operationalCosts, setOperationalCosts] = useState<OperationalCost[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [drinksData, salesData, costsData, materialsData] = await Promise.all([
        apiService.getDrinks(),
        apiService.getSales(),
        apiService.getOperationalCosts(),
        apiService.getRawMaterials(),
      ]);
      setDrinks(drinksData);
      setSales(salesData);
      setOperationalCosts(costsData);
      setRawMaterials(materialsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      drinks,
      sales,
      operationalCosts,
      rawMaterials,
      isLoading,
      fetchData,
      addDrink: wrapWithRefetch(apiService.addDrink),
      updateDrink: wrapWithRefetch(apiService.updateDrink),
      deleteDrink: wrapWithRefetch(apiService.deleteDrink),
      addSale: wrapWithRefetch(apiService.addSale),
      addOperationalCost: wrapWithRefetch(apiService.addOperationalCost),
      updateOperationalCost: wrapWithRefetch(apiService.updateOperationalCost),
      deleteOperationalCost: wrapWithRefetch(apiService.deleteOperationalCost),
      addRawMaterial: wrapWithRefetch(apiService.addRawMaterial),
      updateRawMaterial: wrapWithRefetch(apiService.updateRawMaterial),
      deleteRawMaterial: wrapWithRefetch(apiService.deleteRawMaterial),
    };
  }, [drinks, sales, operationalCosts, rawMaterials, isLoading, fetchData]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
