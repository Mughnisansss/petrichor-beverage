"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Themes are now just light/dark. The color palette is controlled by a separate class
  // on the html element, managed by the theme-toggle. This is a common pattern for this complexity.
  // We'll let the toggle handle the specifics.
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
