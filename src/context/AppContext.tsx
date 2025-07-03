"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Drink, Sale, OperationalCost } from '@/lib/types';

interface AppContextType {
  drinks: Drink[];
  setDrinks: (value: Drink[] | ((val: Drink[]) => Drink[])) => void;
  sales: Sale[];
  setSales: (value: Sale[] | ((val: Sale[]) => Sale[])) => void;
  operationalCosts: OperationalCost[];
  setOperationalCosts: (value: OperationalCost[] | ((val: OperationalCost[]) => OperationalCost[])) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [drinks, setDrinks] = useLocalStorage<Drink[]>("drinks", []);
  const [sales, setSales] = useLocalStorage<Sale[]>("sales", []);
  const [operationalCosts, setOperationalCosts] = useLocalStorage<OperationalCost[]>("operationalCosts", []);

  const value = useMemo(() => ({
    drinks,
    setDrinks,
    sales,
    setSales,
    operationalCosts,
    setOperationalCosts,
  }), [drinks, setDrinks, sales, setSales, operationalCosts, setOperationalCosts]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
