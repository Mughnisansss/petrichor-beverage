import React from "react";
import { CupSoda, Coffee, Bean, GlassWater, Beer, Wine } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

const iconComponents: { [key: string]: React.ElementType } = {
  CupSoda,
  Coffee,
  Bean,
  GlassWater,
  Beer,
  Wine,
};

export function Logo() {
  const { appName, logoIcon } = useAppContext();
  const IconComponent = iconComponents[logoIcon] || CupSoda;

  return (
    <div className="flex items-center gap-2 text-xl font-bold">
      <IconComponent className="h-6 w-6" />
      <span>{appName}</span>
    </div>
  );
}
