
"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const themes = [
  { name: "SipSavvy Light", value: "theme-default-light", colors: ["#FFFFFF", "#020817", "#3B82F6"] },
  { name: "SipSavvy Dark", value: "theme-default-dark", colors: ["#020817", "#FFFFFF", "#3B82F6"] },
  { name: "Sakura Light", value: "theme-sakura-light", colors: ["#FFF1F2", "#881337", "#F43F5E"] },
  { name: "Sakura Dark", value: "theme-sakura-dark", colors: ["#26020d", "#fecdd3", "#fb7185"] },
  { name: "Minty Light", value: "theme-mint-light", colors: ["#F0FDF4", "#14532D", "#22C55E"] },
  { name: "Minty Dark", value: "theme-mint-dark", colors: ["#052e16", "#dcfce7", "#4ade80"] },
  { name: "Sunset Light", value: "theme-sunset-light", colors: ["#FFF7ED", "#7C2D12", "#F97316"] },
  { name: "Sunset Dark", value: "theme-sunset-dark", colors: ["#2c1507", "#fed7aa", "#fb923c"] },
  { name: "Royal Light", value: "theme-royal-light", colors: ["#F5F3FF", "#4C1D95", "#7C3AED"] },
  { name: "Royal Dark", value: "theme-royal-dark", colors: ["#1b0b36", "#ddd6fe", "#a78bfa"] },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {themes.map((t) => (
        <Button
            key={t.value}
            variant="outline"
            className={cn(
                "h-auto justify-start",
                theme === t.value && "border-primary border-2"
            )}
            onClick={() => setTheme(t.value)}
            >
            <div className="flex flex-col items-start gap-2 p-2 w-full">
                <div className="flex items-center justify-between w-full">
                <span className="text-sm font-semibold">{t.name}</span>
                {theme === t.value && <Check className="h-4 w-4" />}
                </div>
                <div className="flex gap-1">
                {t.colors.map((color) => (
                    <div
                    key={color}
                    className="h-5 w-5 rounded-full border"
                    style={{ backgroundColor: color }}
                    />
                ))}
                </div>
            </div>
        </Button>
      ))}
    </div>
  )
}
