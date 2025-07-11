"use client"

import * as React from "react"
import { Check, Palette } from "lucide-react"
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

const THEME_GROUPS = [
  {
    name: "Netral",
    themes: [
      { value: "light", label: "Terang" },
      { value: "dark", label: "Gelap" },
    ],
  },
  {
    name: "Sky",
    themes: [
      { value: "theme-sky-light", label: "Terang" },
      { value: "theme-sky-dark", label: "Gelap" },
    ],
  },
  {
    name: "Rose",
    themes: [
      { value: "theme-rose-light", label: "Terang" },
      { value: "theme-rose-dark", label: "Gelap" },
    ],
  },
  {
    name: "Mint",
    themes: [
      { value: "theme-mint-light", label: "Terang" },
      { value: "theme-mint-dark", label: "Gelap" },
    ],
  },
];

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Pilih Tema</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEME_GROUPS.map((group) => (
          <React.Fragment key={group.name}>
            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 pt-2">
              {group.name}
            </DropdownMenuLabel>
            {group.themes.map((item) => (
              <DropdownMenuItem key={item.value} onClick={() => setTheme(item.value)}>
                <span className="flex-grow">{item.label}</span>
                {theme === item.value && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
