"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const themes = [
  { name: "SipSavvy Light", value: "theme-default-light", colors: ["hsl(var(--card))", "hsl(var(--foreground))", "hsl(var(--primary))"] },
  { name: "SipSavvy Dark", value: "theme-default-dark", colors: ["hsl(var(--card))", "hsl(var(--foreground))", "hsl(var(--primary))"] },
  { name: "Sakura Light", value: "theme-sakura-light", colors: ["hsl(var(--card))", "hsl(var(--foreground))", "hsl(var(--primary))"] },
  { name: "Sakura Dark", value: "theme-sakura-dark", colors: ["hsl(var(--card))", "hsl(var(--foreground))", "hsl(var(--primary))"] },
  { name: "Minty Light", value: "theme-mint-light", colors: ["hsl(var(--card))", "hsl(var(--foreground))", "hsl(var(--primary))"] },
  { name: "Minty Dark", value: "theme-mint-dark", colors: ["hsl(var(--card))", "hsl(var(--foreground))", "hsl(var(--primary))"] },
  { name: "Sunset Light", value: "theme-sunset-light", colors: ["hsl(var(--card))", "hsl(var(--foreground))", "hsl(var(--primary))"] },
  { name: "Sunset Dark", value: "theme-sunset-dark", colors: ["hsl(var(--card))", "hsl(var(--foreground))", "hsl(var(--primary))"] },
  { name: "Royal Light", value: "theme-royal-light", colors: ["hsl(var(--card))", "hsl(var(--foreground))", "hsl(var(--primary))"] },
  { name: "Royal Dark", value: "theme-royal-dark", colors: ["hsl(var(--card))", "hsl(var(--foreground))", "hsl(var(--primary))"] },
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
                <div
                    className="h-5 w-5 rounded-full border"
                    style={{ backgroundColor: t.colors[0] }}
                    />
                 <div
                    className="h-5 w-5 rounded-full border"
                    style={{ backgroundColor: t.colors[1] }}
                    />
                 <div
                    className="h-5 w-5 rounded-full border"
                    style={{ backgroundColor: t.colors[2] }}
                    />
                </div>
            </div>
        </Button>
      ))}
    </div>
  )
}
