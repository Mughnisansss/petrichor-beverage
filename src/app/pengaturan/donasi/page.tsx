"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DanaLogo = () => (
    <svg aria-label="DANA Logo" width="85" height="26" viewBox="0 0 85 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.9242 25.4091C10.3636 25.4091 7.93939 25.0455 5.65151 24.3182C3.36364 23.5909 1.54545 22.4545 0.204545 20.9091L2.62879 18.6364C3.60606 19.8182 4.90151 20.6818 6.51515 21.2273C8.12879 21.7727 9.87879 22.0455 11.7652 22.0455C13.25 22.0455 14.5379 21.8182 15.6288 21.3636C16.7197 20.9091 17.2652 20.1364 17.2652 19.0455C17.2652 18.2273 16.9015 17.5682 16.1742 17.0682C15.447 16.5682 14.3106 16.1591 12.7652 15.8409L9.68939 15.1591C8.25 14.8864 6.90151 14.4545 5.64394 13.8636C4.38636 13.2727 3.36364 12.4545 2.57576 11.4091C1.78788 10.3636 1.39394 9.13636 1.39394 7.72727C1.39394 6.04545 1.94697 4.59091 3.05303 3.36364C4.15909 2.13636 5.68182 1.27273 7.62121 0.772727C9.56061 0.272727 11.6364 0.0227273 13.8485 0.0227273C16.1818 0.0227273 18.3333 0.386364 20.303 1.11364C22.2727 1.84091 23.7348 2.88636 24.6894 4.25L22.2652 6.52273C21.5379 5.61364 20.4924 4.95455 19.1288 4.54545C17.7652 4.13636 16.2273 3.93182 14.5152 3.93182C13.1288 3.93182 11.9697 4.11364 11.0379 4.47727C10.1061 4.84091 9.64015 5.45455 9.64015 6.31818C9.64015 6.97727 9.92803 7.52273 10.5038 7.95455C11.0795 8.38636 11.9318 8.77273 13.0606 9.11364L16.2652 9.84091C18.6364 10.3864 20.5985 11.1136 22.1515 12.0227C23.7045 12.9318 24.4773 14.1591 24.4773 15.7045C24.4773 17.5 23.8636 19.0227 22.6364 20.2727C21.4091 21.5227 19.7197 22.4773 17.5682 23.1364C15.4167 23.7955 13.25 24.125 11.0682 24.125L12.9242 25.4091Z" fill="#108EE9"></path>
        <path d="M43.0881 25V0.5H57.7017V4.45455H49.1336V10.9091H56.5654V14.8182H49.1336V21.0909H57.9786V25H43.0881Z" fill="#108EE9"></path>
        <path d="M71.9329 25.4091C69.3723 25.4091 66.9481 25.0455 64.6602 24.3182C62.3723 23.5909 60.5541 22.4545 59.2132 20.9091L61.6375 18.6364C62.6148 19.8182 63.9102 20.6818 65.5239 21.2273C67.1375 21.7727 68.8875 22.0455 70.7739 22.0455C72.2587 22.0455 73.5466 21.8182 74.6375 21.3636C75.7284 20.9091 76.2739 20.1364 76.2739 19.0455C76.2739 18.2273 75.9102 17.5682 75.1829 17.0682C74.4557 16.5682 73.3193 16.1591 71.7739 15.8409L68.6981 15.1591C67.2587 14.8864 65.9102 14.4545 64.6526 13.8636C63.395 13.2727 62.3723 12.4545 61.5844 11.4091C60.7966 10.3636 60.4026 9.13636 60.4026 7.72727C60.4026 6.04545 60.9557 4.59091 62.0617 3.36364C63.1678 2.13636 64.6905 1.27273 66.6301 0.772727C68.5696 0.272727 70.6454 0.0227273 72.8572 0.0227273C75.1905 0.0227273 77.342 0.386364 79.3117 1.11364C81.2814 1.84091 82.7435 2.88636 83.6981 4.25L81.2739 6.52273C80.5466 5.61364 79.5011 4.95455 78.1375 4.54545C76.7739 4.13636 75.236 3.93182 73.5239 3.93182C72.1375 3.93182 70.9784 4.11364 70.0466 4.47727C69.1148 4.84091 68.6492 5.45455 68.6492 6.31818C68.6492 6.97727 68.9371 7.52273 69.5128 7.95455C70.0885 8.38636 70.9409 8.77273 72.0696 9.11364L75.2739 9.84091C77.6454 10.3864 79.6075 11.1136 81.1606 12.0227C82.7136 12.9318 83.4864 14.1591 83.4864 15.7045C83.4864 17.5 82.8727 19.0227 81.6454 20.2727C80.4182 21.5227 78.7284 22.4773 76.577 23.1364C74.4253 23.7955 72.2587 24.125 70.077 24.125L71.9329 25.4091Z" fill="#108EE9"></path>
    </svg>
);

export default function DonasiPage() {
    const { toast } = useToast();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Disalin!", description: `${text} berhasil disalin ke clipboard.` });
    };
    
    const accountInfo = [
        { label: "Nomor DANA", value: "081234567890" },
        { label: "Atas Nama", value: "Pengembang" },
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
                    <DanaLogo />
                    <h3 className="font-semibold pt-2">Scan QRIS di bawah ini</h3>
                    <Image
                        src="https://placehold.co/200x200.png"
                        alt="QR Code DANA"
                        width={200}
                        height={200}
                        className="rounded-lg"
                        data-ai-hint="qr code"
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
