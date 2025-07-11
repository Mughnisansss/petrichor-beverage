
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

const ACCENT_COLORS = [
  { name: "blue", value: "207 90% 54%", foreground: "210 40% 98%" },
  { name: "yellow", value: "48 96% 53%", foreground: "48 96% 13%" },
  { name: "pink", value: "322 80% 55%", foreground: "210 40% 98%" },
  { name: "purple", value: "264 82% 62%", foreground: "210 40% 98%" },
  { name: "orange", value: "25 95% 53%", foreground: "210 40% 98%" },
  { name: "green", value: "142 71% 45%", foreground: "210 40% 98%" },
]

export function AccentColorProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccent] = useLocalStorage("accent-color", "blue")

  React.useEffect(() => {
    const color = ACCENT_COLORS.find(c => c.name === accent) || ACCENT_COLORS[0];
    const body = document.body;
    body.style.setProperty("--primary", color.value);
    body.style.setProperty("--primary-foreground", color.foreground);
  }, [accent])

  return <>{children}</>
}

export function ThemeProvider({ children, ...props }: Omit<ThemeProviderProps, 'attribute' | 'defaultTheme'>) {
  return (
    <NextThemesProvider
      attribute="class"
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
