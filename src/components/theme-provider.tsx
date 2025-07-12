
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [accent, setAccent] = useLocalStorage<string>('accent-color', '');

  React.useEffect(() => {
    // This effect ensures the accent color class is applied alongside the mode class (light/dark)
    document.documentElement.classList.remove('theme-pink'); // Remove old ones first
    if (accent) {
      document.documentElement.classList.add(accent);
    }
  }, [theme, accent]);
  
  return <>{children}</>
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
      {...props}
    >
      <ThemeColorProvider>
        {children}
      </ThemeColorProvider>
    </NextThemesProvider>
  )
}
