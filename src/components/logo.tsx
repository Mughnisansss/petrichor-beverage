"use client";

import React from "react";
import { CupSoda } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import Image from 'next/image';

export function Logo() {
  const { appName, logoImageUri } = useAppContext();
  const { currentTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 text-xl font-bold font-headline">
      {logoImageUri ? (
        <Image
          src={logoImageUri}
          alt={`${appName} logo`}
          width={24}
          height={24}
          className="h-6 w-6 rounded-sm object-cover"
        />
      ) : (
        <span className="text-2xl">{currentTheme.icon}</span>
      )}
      <span>{appName}</span>
    </div>
  );
}
