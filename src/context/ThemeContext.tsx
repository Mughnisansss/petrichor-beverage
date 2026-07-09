"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ThemeConfig } from '@/lib/themes';
import { getThemeById, themes } from '@/lib/themes';

interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (themeId: string) => void;
  applyTheme: (theme: ThemeConfig) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'petrichor_theme';
const DEFAULT_THEME_ID = 'default';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themes.default);
  const [isInitialized, setIsInitialized] = useState(false);

  // Apply theme CSS variables to document
  const applyTheme = useCallback((theme: ThemeConfig) => {
    const root = document.documentElement;
    const colors = theme.colors;

    // Apply color variables
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    root.style.setProperty('--card', colors.card);
    root.style.setProperty('--card-foreground', colors.cardForeground);
    root.style.setProperty('--popover', colors.popover);
    root.style.setProperty('--popover-foreground', colors.popoverForeground);
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', colors.primaryForeground);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
    root.style.setProperty('--muted', colors.muted);
    root.style.setProperty('--muted-foreground', colors.mutedForeground);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-foreground', colors.accentForeground);
    root.style.setProperty('--destructive', colors.destructive);
    root.style.setProperty('--destructive-foreground', colors.destructiveForeground);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--input', colors.input);
    root.style.setProperty('--ring', colors.ring);
    root.style.setProperty('--radius', theme.borderRadius);
    root.style.setProperty('--chart-1', colors.chart1);
    root.style.setProperty('--chart-2', colors.chart2);

    // Apply font variables
    root.style.setProperty('--font-body', theme.fonts.body);
    root.style.setProperty('--font-headline', theme.fonts.headline);
    root.style.setProperty('--font-accent', theme.fonts.accent);

    // Update document title with theme icon
    const icon = theme.icon;
    document.title = `${icon} ${theme.name}`;
  }, []);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
      const themeId = savedThemeId || DEFAULT_THEME_ID;
      const theme = getThemeById(themeId);
      
      setCurrentTheme(theme);
      applyTheme(theme);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading theme:', error);
      setCurrentTheme(themes.default);
      applyTheme(themes.default);
      setIsInitialized(true);
    }
  }, [applyTheme]);

  // Set theme and persist to localStorage
  const setTheme = useCallback((themeId: string) => {
    const theme = getThemeById(themeId);
    setCurrentTheme(theme);
    applyTheme(theme);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }
  }, [applyTheme]);

  // Reset to default theme
  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME_ID);
  }, [setTheme]);

  const value = {
    currentTheme,
    setTheme,
    applyTheme,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}