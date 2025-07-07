"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

// Inline SVG for Google Icon
const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.72 1.9-3.57 0-6.49-2.95-6.49-6.5s2.92-6.5 6.49-6.5c1.99 0 3.39.77 4.38 1.7l2.5-2.5C18.16 3.01 15.65 2 12.48 2c-5.49 0-9.92 4.45-9.92 9.9s4.43 9.9 9.92 9.9c5.38 0 9.53-3.64 9.53-9.67 0-.65-.05-1.3-.15-1.92H12.48z"
    />
  </svg>
);

interface DummyUser {
  name: string;
  email: string;
  avatar: string;
}

export default function AkunPengaturanPage() {
    const [user, setUser] = useState<DummyUser | null>(null);
    const { toast } = useToast();

    const handleLogin = () => {
        // This is a dummy login. In a real app, you would use an OAuth flow.
        setUser({
            name: "Alex Doe",
            email: "alex.doe@example.com",
            avatar: "https://placehold.co/100x100.png"
        });
        toast({
            title: "Login Berhasil (Simulasi)",
            description: "Anda sekarang terhubung dengan akun Google Anda.",
        });
    };

    const handleLogout = () => {
        setUser(null);
        toast({
            title: "Logout Berhasil",
            description: "Koneksi akun Anda telah diputus.",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Akun & Autentikasi</CardTitle>
                <CardDescription>
                Hubungkan akun Anda untuk sinkronisasi data antar perangkat di masa depan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {user ? (
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                             <Avatar>
                                <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person avatar"/>
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button variant="outline" className="w-full justify-center" onClick={handleLogin}>
                            <GoogleIcon />
                            Login dengan Google
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    {/* The div is necessary for the tooltip to work on a disabled button */}
                                    <div className="w-full">
                                        <Button variant="outline" className="w-full justify-center" disabled>
                                            <Facebook className="mr-2 h-4 w-4" />
                                            Login dengan Facebook
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Segera Hadir</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Saat ini, fitur login hanya berupa simulasi. Fungsionalitas penuh akan ditambahkan pada pembaruan mendatang.
                </p>
             </CardFooter>
        </Card>
    );
}
