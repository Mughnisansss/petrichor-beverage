"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DonationCard = ({ title, qrSrc, accountInfo }: { title: string; qrSrc: string; accountInfo?: { label: string; value: string }[] }) => {
    const { toast } = useToast();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Disalin!", description: `${text} berhasil disalin ke clipboard.` });
    };

    return (
        <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
            <h3 className="font-semibold">{title}</h3>
            <Image
                src={qrSrc}
                alt={`QR Code untuk ${title}`}
                width={200}
                height={200}
                className="rounded-lg"
                data-ai-hint="qr code"
            />
            {accountInfo && (
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
            )}
        </div>
    );
};


export default function DonasiPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Dukung Pengembangan Petrichor</CardTitle>
                <CardDescription>
                    Aplikasi ini dibuat dengan cinta dan dedikasi. Jika Anda merasa aplikasi ini bermanfaat, pertimbangkan untuk memberikan donasi untuk mendukung pengembangan fitur baru dan pemeliharaan di masa depan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-sm text-center">
                    Setiap dukungan, sekecil apapun, sangat berarti bagi kami. Terima kasih!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DonationCard
                        title="GoPay / OVO / Dana"
                        qrSrc="https://placehold.co/200x200.png"
                    />
                    <DonationCard
                        title="ShopeePay"
                        qrSrc="https://placehold.co/200x200.png"
                    />
                     <DonationCard
                        title="Transfer Bank"
                        qrSrc="https://placehold.co/200x200.png"
                        accountInfo={[
                            { label: "Bank", value: "BCA" },
                            { label: "No. Rek", value: "1234567890" },
                            { label: "Atas Nama", value: "Pengembang" },
                        ]}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
