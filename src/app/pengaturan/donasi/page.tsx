
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLink, Heart } from "lucide-react";

export default function DonasiPage() {
    // Anda bisa mengganti link ini dengan link Saweria, Trakteer, atau platform donasi Anda.
    const donationLink = "https://saweria.co/example";

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
                    <h3 className="font-semibold">Terima Kasih!</h3>
                    <p className="text-sm text-muted-foreground">
                        Setiap dukungan, berapapun jumlahnya, sangat berarti dan membantu saya untuk terus menjaga dan meningkatkan kualitas aplikasi ini.
                    </p>
                    <Button asChild>
                        <Link href={donationLink} target="_blank" rel="noopener noreferrer">
                            Donasi Sekarang <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
