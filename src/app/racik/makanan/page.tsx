"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MakananPage() {
  return (
    <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Manajemen Makanan</h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Segera Hadir</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Fitur untuk mengelola resep dan harga makanan sedang dalam pengembangan.</p>
            </CardContent>
        </Card>
    </div>
  );
}
