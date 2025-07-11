
"use client"

import * as React from "react"
import { Check, Palette } from "lucide-react"
import { useTheme } from "next-themes"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const ACCENT_COLORS = [
  { name: "blue", color: "hsl(207, 90%, 54%)" },
  { name: "green", color: "hsl(142, 71%, 45%)" },
  { name: "yellow", color: "hsl(48, 96%, 53%)" },
  { name: "orange", color: "hsl(25, 95%, 53%)" },
  { name: "red", color: "hsl(0, 84.2%, 60.2%)" },
  { name: "pink", color: "hsl(322, 80%, 55%)" },
  { name: "purple", color: "hsl(264, 82%, 62%)" },
  { name: "navy", color: "hsl(222, 47%, 21%)" },
  { name: "army", color: "hsl(88, 38%, 42%)" },
] as const

type AccentColor = (typeof ACCENT_COLORS)[number]["name"];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [accent, setAccent] = useLocalStorage<AccentColor>("accent-color", "blue")

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="grid gap-6">
          <div className="space-y-2">
            <h3 className="font-medium">Color</h3>
            <div className="flex flex-wrap items-center justify-between gap-2">
              {ACCENT_COLORS.map(({ name, color }) => (
                <Button
                  key={name}
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full border-2",
                    accent === name && "border-primary"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setAccent(name)}
                >
                  {accent === name && <Check className="h-5 w-5 text-white" />}
                  <span className="sr-only">{name}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Background</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === "light" ? "secondary" : "outline"}
                onClick={() => setTheme("light")}
                className="justify-start"
              >
                Default
              </Button>
              <Button
                variant={theme === "dim" ? "secondary" : "outline"}
                onClick={() => setTheme("dim")}
                 className="justify-start"
              >
                Dim
              </Button>
              <Button
                variant={theme === "dark" ? "secondary" : "outline"}
                onClick={() => setTheme("dark")}
                 className="justify-start"
              >
                Lights out
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
