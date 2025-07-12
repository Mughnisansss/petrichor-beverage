"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

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
        <DropdownMenuItem onClick={() => setTheme("theme-default-light")}>
          SipSavvy Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-default-dark")}>
          SipSavvy Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-sakura-light")}>
          Sakura Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-sakura-dark")}>
          Sakura Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-mint-light")}>
          Minty Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-mint-dark")}>
          Minty Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-sunset-light")}>
          Sunset Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-sunset-dark")}>
          Sunset Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-royal-light")}>
          Royal Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-royal-dark")}>
          Royal Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
