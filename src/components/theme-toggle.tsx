"use client"

import * as React from "react"
import { Check, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const THEME_OPTIONS = [
  { value: "sky", label: "Sky (Default)", color: "hsl(207 44% 49%)" },
  { value: "rose", label: "Rose", color: "hsl(160 50% 70%)" },
  { value: "mint", label: "Mint", color: "hsl(150 50% 45%)" },
];

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  const handleModeChange = (newMode: string) => {
    // Logic to preserve the color when switching between light/dark
    const currentColorTheme = THEME_OPTIONS.find(opt => theme?.includes(opt.value))?.value || 'sky';
    if (newMode === 'light') {
      setTheme(currentColorTheme);
    } else {
      setTheme('dark');
    }
  };

  const handleColorChange = (newColor: string) => {
    setTheme(newColor);
  };
  
  const currentMode = theme === 'dark' ? 'dark' : 'light';
  const currentColor = THEME_OPTIONS.find(opt => theme?.includes(opt.value))?.value || 'sky';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Mode</DropdownMenuLabel>
        <div className="grid grid-cols-2 gap-2 px-2 py-1">
            <Button variant={currentMode === 'light' ? 'secondary' : 'outline'} size="sm" onClick={() => handleModeChange('light')}>Light</Button>
            <Button variant={currentMode === 'dark' ? 'secondary' : 'outline'} size="sm" onClick={() => handleModeChange('dark')}>Dark</Button>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Warna</DropdownMenuLabel>
        <div className="flex justify-around items-center px-2 py-1">
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

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
