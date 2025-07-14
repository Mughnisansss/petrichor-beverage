
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

export default function DonasiPage() {
    const danaName = "MUGNI SANTOSO";
    const danaNumber = "085340458336";

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                     <div className="p-3 bg-destructive/10 rounded-lg">
                        <Heart className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle>Dukung Pengembangan Aplikasi</CardTitle>
                </div>
                <CardDescription>
                    Aplikasi ini dikembangkan dan disediakan secara gratis. Jika Anda merasa terbantu, pertimbangkan untuk memberikan donasi untuk mendukung pengembangan fitur-fitur baru di masa depan.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-start gap-4 p-6 border rounded-lg bg-muted/50">
                    <h3 className="font-semibold">Donasi via DANA</h3>
                    <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">Nama Penerima:</p>
                        <p className="font-semibold text-lg">{danaName}</p>
                    </div>
                     <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">Nomor DANA:</p>
                        <p className="font-semibold text-lg">{danaNumber}</p>
                    </div>
                    <p className="text-xs text-muted-foreground pt-4">
                        Setiap dukungan, berapapun jumlahnya, sangat berarti dan membantu saya untuk terus menjaga dan meningkatkan kualitas aplikasi ini. Terima kasih!
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
