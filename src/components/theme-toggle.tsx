
"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const themes = [
  { name: "SipSavvy Light", value: "theme-default-light", colors: ["#f8fafc", "#0f172a", "#1e40af"] },
  { name: "SipSavvy Dark", value: "theme-default-dark", colors: ["#0f172a", "#f8fafc", "#60a5fa"] },
  { name: "Sakura Light", value: "theme-sakura-light", colors: ["#fdf2f8", "#9f1239", "#f43f5e"] },
  { name: "Sakura Dark", value: "theme-sakura-dark", colors: ["#26020d", "#fecdd3", "#fb7185"] },
  { name: "Minty Light", value: "theme-mint-light", colors: ["#f0fdf4", "#14532d", "#22c55e"] },
  { name: "Minty Dark", value: "theme-mint-dark", colors: ["#052e16", "#dcfce7", "#4ade80"] },
  { name: "Sunset Light", value: "theme-sunset-light", colors: ["#fff7ed", "#9a3412", "#f97316"] },
  { name: "Sunset Dark", value: "theme-sunset-dark", colors: ["#2c1507", "#fed7aa", "#fb923c"] },
  { name: "Royal Light", value: "theme-royal-light", colors: ["#f5f3ff", "#5b21b6", "#8b5cf6"] },
  { name: "Royal Dark", value: "theme-royal-dark", colors: ["#1b0b36", "#ddd6fe", "#a78bfa"] },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {themes.map((t) => (
        <div key={t.value}>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start h-auto",
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
        </div>
      ))}
    </div>
  )
}
