
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function TampilanPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tampilan & Tema</CardTitle>
                <CardDescription>
                    Personalisasi tampilan visual aplikasi sesuai selera Anda.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Palette className="h-5 w-5 text-muted-foreground" />
                     <Label>Pilih Tema</Label>
                   </div>
                   <ThemeToggle />
                </div>
            </CardContent>
        </Card>
    )
}
