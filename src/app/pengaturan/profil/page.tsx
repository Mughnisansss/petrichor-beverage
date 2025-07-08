"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageIcon, Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ProfilPengaturanPage() {
    const { toast } = useToast();
    const { 
        appName, setAppName,
        logoImageUri, setLogoImageUri,
        marqueeText, setMarqueeText
    } = useAppContext();

    const [localAppName, setLocalAppName] = useState(appName);
    const [localMarqueeText, setLocalMarqueeText] = useState(marqueeText);
    const [preview, setPreview] = useState<string | null>(logoImageUri);

    useEffect(() => {
        setLocalAppName(appName);
        setPreview(logoImageUri);
        setLocalMarqueeText(marqueeText);
    }, [appName, logoImageUri, marqueeText]);

    const hasChanges = (localAppName.trim() && localAppName.trim() !== appName) || (localMarqueeText.trim() && localMarqueeText.trim() !== marqueeText);

    const handleSaveSettings = () => {
        const changesMade: string[] = [];
        if (localAppName.trim() && localAppName.trim() !== appName) {
            setAppName(localAppName.trim());
            changesMade.push("Nama aplikasi diperbarui.");
        }
        if (localMarqueeText.trim() && localMarqueeText.trim() !== marqueeText) {
            setMarqueeText(localMarqueeText.trim());
            changesMade.push("Teks berjalan diperbarui.");
        }
        
        if (changesMade.length > 0) {
            toast({ title: "Pengaturan Disimpan", description: changesMade.join(" ") });
        }
    };
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ title: "Ukuran File Terlalu Besar", description: "Silakan pilih gambar dengan ukuran di bawah 5MB.", variant: "destructive" });
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreview(result);
            setLogoImageUri(result);
            toast({ title: "Logo Disimpan", description: "Logo kustom Anda telah diunggah dan disimpan." });
        };
        reader.readAsDataURL(file);
    };
  
    const handleRemoveLogo = () => {
        setPreview(null);
        setLogoImageUri(null);
        toast({ title: "Logo Dihapus", description: "Logo kustom telah dihapus." });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profil & Tampilan</CardTitle>
                <CardDescription>
                Atur informasi dasar dan tampilan toko Anda.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Informasi Toko</h3>
                    <div className="space-y-2">
                        <Label htmlFor="appName">Nama Aplikasi</Label>
                        <Input id="appName" value={localAppName} onChange={(e) => setLocalAppName(e.target.value)} placeholder="Masukkan nama aplikasi/toko Anda" />
                        <p className="text-sm text-muted-foreground">Nama ini akan muncul di logo, pesan selamat datang, teks berjalan, dan beberapa bagian lain di aplikasi.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="marqueeText">Teks Berjalan</Label>
                        <Input id="marqueeText" value={localMarqueeText} onChange={(e) => setLocalMarqueeText(e.target.value)} placeholder="Pesan selamat datang atau promosi" />
                        <p className="text-sm text-muted-foreground">Gunakan `&#123;appName&#125;` untuk menampilkan nama aplikasi secara dinamis.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logoUpload">Logo Aplikasi (1:1)</Label>
                        <div className="flex items-center gap-4">
                            {preview ? <Image src={preview} alt="Logo preview" width={64} height={64} className="h-16 w-16 rounded-md object-cover border" /> : <div className="h-16 w-16 rounded-md border bg-muted flex items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="logoUpload" className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}><Upload className="mr-2 h-4 w-4" /> Unggah Gambar</Label>
                                <Input id="logoUpload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleLogoChange} className="hidden" />
                                {preview && <Button variant="ghost" size="sm" onClick={handleRemoveLogo} className="justify-start"><Trash2 className="mr-2 h-4 w-4" /> Hapus Logo</Button>}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Rasio 1:1 direkomendasikan. Maks 5MB.</p>
                    </div>
                </div>
            </CardContent>
             <CardFooter>
                <Button onClick={handleSaveSettings} disabled={!hasChanges}>Simpan Perubahan</Button>
            </CardFooter>
        </Card>
    )
}
