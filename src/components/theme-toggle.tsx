"use client"

import * as React from "react"
import { Check, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const THEME_OPTIONS = [
  { value: "theme-sky", label: "Sky (Default)", color: "hsl(207 44% 49%)" },
  { value: "theme-rose", label: "Rose", color: "hsl(160 50% 70%)" },
  { value: "theme-mint", label: "Mint", color: "hsl(150 50% 45%)" },
];

export function ThemeToggle() {
  const { setTheme: setMode, resolvedTheme } = useTheme()
  const [currentColor, setCurrentColor] = React.useState("theme-sky");

  React.useEffect(() => {
    const storedColor = localStorage.getItem("ui-color") || "theme-sky";
    setCurrentColor(storedColor);
    // Ensure the class is added on mount
    if (!document.documentElement.classList.contains(storedColor)) {
      document.documentElement.classList.add(storedColor);
    }
  }, []);

  const handleColorChange = (newColor: string) => {
    // Remove the old color class
    THEME_OPTIONS.forEach(option => {
      document.documentElement.classList.remove(option.value);
    });
    // Add the new color class
    document.documentElement.classList.add(newColor);
    // Persist the new color
    localStorage.setItem("ui-color", newColor);
    setCurrentColor(newColor);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto">
        <DropdownMenuLabel>Tema</DropdownMenuLabel>
        <div className="flex items-center gap-2 px-2 py-1">
          {/* Light/Dark Mode Buttons */}
          <Button variant={resolvedTheme === 'light' ? 'secondary' : 'outline'} size="sm" onClick={() => setMode('light')}>Light</Button>
          <Button variant={resolvedTheme === 'dark' ? 'secondary' : 'outline'} size="sm" onClick={() => setMode('dark')}>Dark</Button>
          
          {/* Color Theme Buttons */}
          {THEME_OPTIONS.map((option) => (
             <Button
              key={option.value}
              variant="ghost"
              size="icon"
              onClick={() => handleColorChange(option.value)}
              className={cn(
                "h-8 w-8 rounded-full",
                currentColor === option.value && "ring-2 ring-ring ring-offset-2 ring-offset-background"
              )}
              style={{ backgroundColor: option.color }}
              aria-label={option.label}
            >
              {currentColor === option.value && <Check className="h-5 w-5 text-white mix-blend-difference" />}
            </Button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
