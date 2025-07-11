
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

const ACCENT_COLOR_CLASS_NAME_MAP = {
  blue: "theme-blue",
  yellow: "theme-yellow",
  pink: "theme-pink",
  purple: "theme-purple",
  orange: "theme-orange",
  green: "theme-green",
} as const;

type AccentColor = keyof typeof ACCENT_COLOR_CLASS_NAME_MAP;

type CustomThemeProviderProps = ThemeProviderProps & {
  children: React.ReactNode;
};

// This component now only manages the accent color class on the <html> tag.
const AccentColorProvider = ({ children }: { children: React.ReactNode }) => {
  const [accentColor] = useLocalStorage<AccentColor>("accent-color", "blue");

  React.useEffect(() => {
    const newClassName = ACCENT_COLOR_CLASS_NAME_MAP[accentColor] || ACCENT_COLOR_CLASS_NAME_MAP.blue;
    
    // Remove any existing theme- class
    Object.values(ACCENT_COLOR_CLASS_NAME_MAP).forEach((className) => {
      document.documentElement.classList.remove(className);
    });
    
    // Add the new class
    document.documentElement.classList.add(newClassName);
  }, [accentColor]);

  return <>{children}</>;
};

export function ThemeProvider({ children, ...props }: Omit<CustomThemeProviderProps, 'attribute' | 'defaultTheme'>) {
  return (
    <NextThemesProvider
      attribute="class" // This will manage 'light', 'dim', 'dark' classes
      defaultTheme="dim"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      <AccentColorProvider>
        {children}
      </AccentColorProvider>
    </NextThemesProvider>
  )
}
