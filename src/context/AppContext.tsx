"use client";

import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Drink, Sale } from '@/lib/types';

interface AppContextType {
  drinks: Drink[];
  setDrinks: (value: Drink[] | ((val: Drink[]) => Drink[])) => void;
  sales: Sale[];
  setSales: (value: Sale[] | ((val: Sale[]) => Sale[])) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [drinks, setDrinks] = useLocalStorage<Drink[]>("drinks", []);
  const [sales, setSales] = useLocalStorage<Sale[]>("sales", []);

  const value = {
    drinks,
    setDrinks,
    sales,
    setSales,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
