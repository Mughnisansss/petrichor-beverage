"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ThemeButtonProps {
  name: string
  value: string
  colors: string[]
  isActive: boolean
  onSelect: () => void
}

export function ThemeButton({
  name,
  value,
  colors,
  isActive,
  onSelect,
}: ThemeButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "h-auto justify-start",
        isActive && "border-primary border-2"
      )}
      onClick={onSelect}
    >
      <div className="flex flex-col items-start gap-2 p-2 w-full">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-semibold">{name}</span>
          {isActive && <Check className="h-4 w-4" />}
        </div>
        <div className="flex gap-1">
          {colors.map((color, index) => (
            <div
              key={index}
              className="h-5 w-5 rounded-full border"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </Button>
  )
}
