"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { ThemeButton } from "./theme-button"

const themes = [
  { name: "SipSavvy Light", value: "theme-default-light", colors: ["#87CEEB", "#F0F8FF", "#4682B4"] },
  { name: "SipSavvy Dark", value: "theme-default-dark", colors: ["#4682B4", "#F0F8FF", "#87CEEB"] },
  { name: "Sakura Light", value: "theme-sakura-light", colors: ["#FFF0F5", "#592330", "#DB2777"] },
  { name: "Sakura Dark", value: "theme-sakura-dark", colors: ["#290f18", "#FDE8EF", "#F472B6"] },
  { name: "Minty Light", value: "theme-mint-light", colors: ["#F0FFF4", "#164E3B", "#10B981"] },
  { name: "Minty Dark", value: "theme-mint-dark", colors: ["#062A1E", "#D1FAE5", "#6EE7B7"] },
  { name: "Sunset Light", value: "theme-sunset-light", colors: ["#FFF7ED", "#6B21A8", "#F97316"] },
  { name: "Sunset Dark", value: "theme-sunset-dark", colors: ["#210f36", "#FEEBC8", "#FB923C"] },
  { name: "Royal Light", value: "theme-royal-light", colors: ["#F3F4FF", "#2E1065", "#6D28D9"] },
  { name: "Royal Dark", value: "theme-royal-dark", colors: ["#140b29", "#E0E7FF", "#A78BFA"] },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      <ThemeButton
        name="SipSavvy Light"
        value="theme-default-light"
        colors={["#87CEEB", "#F0F8FF", "#4682B4"]}
        isActive={theme === "theme-default-light"}
        onSelect={() => setTheme("theme-default-light")}
      />
      <ThemeButton
        name="SipSavvy Dark"
        value="theme-default-dark"
        colors={["#4682B4", "#F0F8FF", "#87CEEB"]}
        isActive={theme === "theme-default-dark"}
        onSelect={() => setTheme("theme-default-dark")}
      />
      <ThemeButton
        name="Sakura Light"
        value="theme-sakura-light"
        colors={["#FFF0F5", "#592330", "#DB2777"]}
        isActive={theme === "theme-sakura-light"}
        onSelect={() => setTheme("theme-sakura-light")}
      />
      <ThemeButton
        name="Sakura Dark"
        value="theme-sakura-dark"
        colors={["#290f18", "#FDE8EF", "#F472B6"]}
        isActive={theme === "theme-sakura-dark"}
        onSelect={() => setTheme("theme-sakura-dark")}
      />
      <ThemeButton
        name="Minty Light"
        value="theme-mint-light"
        colors={["#F0FFF4", "#164E3B", "#10B981"]}
        isActive={theme === "theme-mint-light"}
        onSelect={() => setTheme("theme-mint-light")}
      />
      <ThemeButton
        name="Minty Dark"
        value="theme-mint-dark"
        colors={["#062A1E", "#D1FAE5", "#6EE7B7"]}
        isActive={theme === "theme-mint-dark"}
        onSelect={() => setTheme("theme-mint-dark")}
      />
      <ThemeButton
        name="Sunset Light"
        value="theme-sunset-light"
        colors={["#FFF7ED", "#6B21A8", "#F97316"]}
        isActive={theme === "theme-sunset-light"}
        onSelect={() => setTheme("theme-sunset-light")}
      />
      <ThemeButton
        name="Sunset Dark"
        value="theme-sunset-dark"
        colors={["#210f36", "#FEEBC8", "#FB923C"]}
        isActive={theme === "theme-sunset-dark"}
        onSelect={() => setTheme("theme-sunset-dark")}
      />
      <ThemeButton
        name="Royal Light"
        value="theme-royal-light"
        colors={["#F3F4FF", "#2E1065", "#6D28D9"]}
        isActive={theme === "theme-royal-light"}
        onSelect={() => setTheme("theme-royal-light")}
      />
      <ThemeButton
        name="Royal Dark"
        value="theme-royal-dark"
        colors={["#140b29", "#E0E7FF", "#A78BFA"]}
        isActive={theme === "theme-royal-dark"}
        onSelect={() => setTheme("theme-royal-dark")}
      />
    </div>
  )
}
