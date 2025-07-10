"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function DonasiPage() {
    const { toast } = useToast();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Disalin!", description: `${text} berhasil disalin ke clipboard.` });
    };
    
    const accountInfo = [
        { label: "Nomor DANA", value: "085340458336" },
        { label: "Atas Nama", value: "MUGNI SANTOSO" },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dukung Pengembangan Petrichor</CardTitle>
                <CardDescription>
                    Aplikasi ini dibuat dengan cinta dan dedikasi. Jika Anda merasa aplikasi ini bermanfaat, pertimbangkan untuk memberikan donasi untuk mendukung pengembangan fitur baru dan pemeliharaan di masa depan.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
                <p className="text-sm text-center text-muted-foreground">
                    Setiap dukungan, sekecil apapun, sangat berarti bagi kami. Terima kasih!
                </p>
                
                <div className="flex flex-col items-center gap-4 rounded-lg border p-6 max-w-sm w-full">
                    <h3 className="font-semibold text-xl">Donasi via DANA</h3>
                    <p className="text-sm text-muted-foreground text-center pb-2">Scan QRIS di bawah ini menggunakan aplikasi DANA Anda.</p>
                    <Image
                        src="/donasi.jpg"
                        alt="QR Code DANA untuk MUGNI SANTOSO"
                        width={200}
                        height={200}
                        className="rounded-lg"
                    />
                    <div className="w-full space-y-2 pt-2">
                        {accountInfo.map((info, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{info.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-medium">{info.value}</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(info.value)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
