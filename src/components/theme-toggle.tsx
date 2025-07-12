"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { ThemeButton } from "./theme-button"

const themes = [
  { name: "SipSavvy Light", value: "theme-default-light", colors: ["#FFFFFF", "#0A2540", "#4682B4"] },
  { name: "SipSavvy Dark", value: "theme-default-dark", colors: ["#0A2540", "#F0F8FF", "#87CEEB"] },
  { name: "Sakura Light", value: "theme-sakura-light", colors: ["#FFF0F5", "#592330", "#DB2777"] },
  { name: "Sakura Dark", value: "theme-sakura-dark", colors: ["#290f18", "#FDE8EF", "#F472B6"] },
  { name: "Minty Light", value: "theme-mint-light", colors: ["#F0FFF4", "#164E3B", "#10B981"] },
  { name: "Minty Dark", value: "theme-mint-dark", colors: ["#062A1E", "#D1FAE5", "#6EE7B7"] },
  { name: "Sunset Light", value: "theme-sunset-light", colors: ["#FFF7ED", "#6B21A8", "#F97316"] },
  { name: "Sunset Dark", value: "theme-sunset-dark", colors: ["#210f36", "#FEEBC8", "#FB923C"] },
  { name: "Royal Light", value: "theme-royal-light", colors: ["#F3F4FF", "#2E1065", "#6D28D9"] },
  { name: "Royal Dark", value: "theme-royal-dark", colors: ["#140b29", "#E0E7FF", "#A78BFA"] },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {themes.map((t) => (
        <ThemeButton
          key={t.value}
          name={t.name}
          value={t.value}
          colors={t.colors}
          isActive={theme === t.value}
          onSelect={() => setTheme(t.value)}
        />
      ))}
    </div>
  )
}
