
"use client";

import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Wrench } from "lucide-react";

export default function TampilanPage() {
    return (
        <Card>
            <CardHeader>
                 <CardTitle>Tampilan & Tema</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert>
                    <Wrench className="h-4 w-4" />
                    <AlertTitle>Sedang Dalam Perbaikan</AlertTitle>
                    <AlertDescription>
                        Fitur kustomisasi tema sedang kami tingkatkan untuk memberikan pengalaman yang lebih baik dan lebih stabil. Fitur ini akan segera kembali. Terima kasih atas pengertian Anda.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
}
