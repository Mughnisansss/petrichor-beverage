"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

const THEMES = [
  "light",
  "dark",
  "theme-sky-light",
  "theme-sky-dark",
  "theme-rose-light",
  "theme-rose-dark",
  "theme-mint-light",
  "theme-mint-dark",
];

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props} themes={THEMES}>{children}</NextThemesProvider>
}
