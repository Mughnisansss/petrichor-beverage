"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";

// Inline SVG for Google Icon
const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.72 1.9-3.57 0-6.49-2.95-6.49-6.5s2.92-6.5 6.49-6.5c1.99 0 3.39.77 4.38 1.7l2.5-2.5C18.16 3.01 15.65 2 12.48 2c-5.49 0-9.92 4.45-9.92 9.9s4.43 9.9 9.92 9.9c5.38 0 9.53-3.64 9.53-9.67 0-.65-.05-1.3-.15-1.92H12.48z"
    />
  </svg>
);


export default function AkunPengaturanPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Akun & Autentikasi</CardTitle>
                <CardDescription>
                Hubungkan akun Anda untuk sinkronisasi data antar perangkat di masa depan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" className="w-full justify-center">
                    <GoogleIcon />
                    Login dengan Google
                    </Button>
                    <Button variant="outline" className="w-full justify-center">
                    <Facebook className="mr-2 h-4 w-4" />
                    Login dengan Facebook
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
