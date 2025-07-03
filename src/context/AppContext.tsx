"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Drink, Sale, OperationalCost } from '@/lib/types';

interface AppContextType {
  drinks: Drink[];
  sales: Sale[];
  operationalCosts: OperationalCost[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [operationalCosts, setOperationalCosts] = useState<OperationalCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [drinksRes, salesRes, costsRes] = await Promise.all([
        fetch('/api/drinks'),
        fetch('/api/sales'),
        fetch('/api/operasional')
      ]);
      const [drinksData, salesData, costsData] = await Promise.all([
        drinksRes.json(),
        salesRes.json(),
        costsRes.json()
      ]);
      setDrinks(drinksData);
      setSales(salesData);
      setOperationalCosts(costsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = useMemo(() => ({
    drinks,
    sales,
    operationalCosts,
    isLoading,
    fetchData,
  }), [drinks, sales, operationalCosts, isLoading, fetchData]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
