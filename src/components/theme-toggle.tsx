
"use client"

import * as React from "react"
import { Moon, Sun, Palette, Check } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function ThemeToggle() {
  const { setTheme } = useTheme()
  const [accent, setAccent] = useLocalStorage('accent-color', '');

  const accentColors = [
    { name: 'Biru', value: '', color: '#3b82f6' }, // Default blue
    { name: 'Pink', value: 'theme-pink', color: '#ec4899' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Mode</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Terang
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Gelap
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Warna Aksen</DropdownMenuLabel>
        {accentColors.map((color) => (
          <DropdownMenuItem key={color.name} onClick={() => setAccent(color.value)}>
            <div
                className="mr-2 h-5 w-5 rounded-full border"
                style={{ backgroundColor: color.color }}
            />
            <span>{color.name}</span>
            {accent === color.value && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
