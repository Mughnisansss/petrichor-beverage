
"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { ImageIcon, Upload, Trash2 } from "lucide-react";
import Image from "next/image";

export default function PengaturanPage() {
  const { toast } = useToast();
  const { 
    drinks,
    foods,
    sales, 
    rawMaterials, 
    operationalCosts, 
    isLoading,
    storageMode,
    setStorageMode,
    appName,
    setAppName,
    logoImageUri,
    setLogoImageUri,
  } = useAppContext();

  const [selectedMode, setSelectedMode] = useState(storageMode);
  const [localAppName, setLocalAppName] = useState(appName);
  const [preview, setPreview] = useState<string | null>(logoImageUri);

  useEffect(() => {
    setSelectedMode(storageMode);
    setLocalAppName(appName);
    setPreview(logoImageUri);
  }, [storageMode, appName, logoImageUri]);

  const handleSaveSettings = () => {
    const changesMade: string[] = [];

    if (localAppName.trim() && localAppName.trim() !== appName) {
      setAppName(localAppName.trim());
      changesMade.push("Nama aplikasi diperbarui.");
    }

    if (selectedMode !== storageMode) {
      setStorageMode(selectedMode);
      changesMade.push("Mode penyimpanan diubah.");
    }

    if (changesMade.length > 0) {
      toast({
        title: "Pengaturan Disimpan",
        description: changesMade.join(" "),
      });
    }
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) { // 1MB limit
        toast({
            title: "Ukuran File Terlalu Besar",
            description: "Silakan pilih gambar dengan ukuran di bawah 1MB.",
            variant: "destructive"
        });
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setLogoImageUri(result);
        toast({
            title: "Logo Disimpan",
            description: "Logo kustom Anda telah diunggah dan disimpan.",
        });
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveLogo = () => {
    setPreview(null);
    setLogoImageUri(null);
    toast({
        title: "Logo Dihapus",
        description: "Logo kustom telah dihapus.",
    });
  };


  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Ekspor Berhasil",
      description: `${filename} telah diunduh.`,
    });
  };

  const handleExportJson = () => {
    if (isLoading) {
      toast({ title: "Harap tunggu", description: "Data sedang dimuat." });
      return;
    }
    const allData = {
      appName,
      logoImageUri,
      drinks,
      foods,
      sales,
      rawMaterials,
      operationalCosts,
    };
    const filename = `${appName.toLowerCase().replace(/\s/g, '_')}_backup.json`;
    downloadFile(JSON.stringify(allData, null, 2), filename, "application/json");
  };

  const convertToCsv = (data: Record<string, any>[]) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')]; // Header row

    for (const row of data) {
        const values = headers.map(header => {
            let cell = row[header];
            if (cell === null || cell === undefined) {
                cell = '';
            } else if (typeof cell === 'object') {
                cell = JSON.stringify(cell);
            }
            const cellString = String(cell).replace(/"/g, '""');
            return `"${cellString}"`;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  };

  const exportDataAsCsv = (data: any[], filename: string, processor?: (data: any[]) => any[]) => {
    if (isLoading) {
      toast({ title: "Harap tunggu", description: "Data sedang dimuat." });
      return;
    }
    if (data.length === 0) {
      toast({ title: "Data Kosong", description: `Tidak ada data untuk diekspor pada ${filename}.`, variant: "destructive" });
      return;
    }
    const processedData = processor ? processor(data) : data;
    const csvContent = convertToCsv(processedData);
    downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
  }

  const processSalesForCsv = (salesData: typeof sales) => {
    return salesData.map(sale => {
      const product = sale.productType === 'drink' 
        ? drinks.find(d => d.id === sale.productId)
        : foods.find(f => f.id === sale.productId);
      const toppingsString = (sale.selectedToppings || []).map(t => {
        const material = rawMaterials.find(m => m.id === t.rawMaterialId);
        return material?.name || 'N/A';
      }).join('; ');

      return {
        id: sale.id,
        tanggal: sale.date,
        tipe_produk: sale.productType,
        nama_produk: product?.name || 'ID tidak ditemukan',
        jumlah: sale.quantity,
        diskon_persen: sale.discount,
        total_pendapatan: sale.totalSalePrice,
        toppings: toppingsString,
      }
    });
  }

  const processProductsForCsv = (productsData: typeof drinks | typeof foods) => {
    return productsData.map(product => {
      const ingredientsString = product.ingredients.map(ing => {
        const material = rawMaterials.find(m => m.id === ing.rawMaterialId);
        return `${material?.name || '?'}:${ing.quantity}${material?.unit || ''}`;
      }).join('; ');
      return {
        id: product.id,
        nama_produk: product.name,
        harga_pokok: product.costPrice,
        harga_jual: product.sellingPrice,
        resep: ingredientsString,
      }
    });
  }

  const hasChanges = (selectedMode !== storageMode) || (localAppName.trim() && localAppName.trim() !== appName);

  return (
    <MainLayout>
      <div className="flex justify-center items-start pt-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Pengaturan Aplikasi</CardTitle>
            <CardDescription>
              Kelola pengaturan umum dan data aplikasi Anda. Klik "Simpan Pengaturan" untuk menerapkan perubahan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Toko</h3>
              <div className="space-y-2">
                <Label htmlFor="appName">Nama Aplikasi</Label>
                <Input
                  id="appName"
                  value={localAppName}
                  onChange={(e) => setLocalAppName(e.target.value)}
                  placeholder="Masukkan nama aplikasi/toko Anda"
                />
                <p className="text-sm text-muted-foreground">
                  Nama ini akan muncul sebagai logo dan di beberapa judul halaman.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUpload">Logo Aplikasi (1:1)</Label>
                <div className="flex items-center gap-4">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Logo preview"
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-md object-cover border"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-md border bg-muted flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                         <Label htmlFor="logoUpload" className="cursor-pointer">
                            <div className={cn(Button.prototype.constructor.name, "cursor-pointer")}>
                                <Upload className="mr-2 h-4 w-4" /> Unggah Gambar
                            </div>
                         </Label>
                        <Input
                            id="logoUpload"
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleLogoChange}
                            className="hidden"
                        />
                       
                        {preview && (
                            <Button variant="ghost" size="sm" onClick={handleRemoveLogo} className="justify-start">
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus Logo
                            </Button>
                        )}
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    Ganti ikon default dengan logo Anda. Rasio 1:1 direkomendasikan. Maks 1MB.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Mode Penyimpanan Data</h3>
              <p className="text-sm text-muted-foreground">
                Pilih di mana data aplikasi Anda disimpan. Perubahan akan diterapkan setelah menekan tombol simpan.
              </p>
               <RadioGroup 
                value={selectedMode} 
                onValueChange={(value) => setSelectedMode(value as "local" | "server")}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="local" id="local" />
                  <Label htmlFor="local">Penyimpanan Browser (Lokal)</Label>
                </div>
                <p className="text-xs text-muted-foreground pl-6">Data disimpan hanya di browser ini. Cocok untuk penggunaan pribadi dan offline. Data tidak akan tersinkronisasi antar perangkat.</p>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="server" id="server" />
                  <Label htmlFor="server">Penyimpanan Server (Mode Demo)</Label>
                </div>
                 <p className="text-xs text-muted-foreground pl-6">Mode pengembangan. Data disimpan di server dalam file `db.json`. **Tidak cocok untuk deployment produksi karena data bisa hilang.**</p>

                <div className="flex items-center space-x-2 opacity-50">
                  <RadioGroupItem value="cloud" id="cloud" disabled />
                  <Label htmlFor="cloud">Database Cloud (Dalam Pengembangan)</Label>
                </div>
                 <p className="text-xs text-muted-foreground pl-6">Sinkronkan data di berbagai perangkat. Fitur mendatang.</p>
              </RadioGroup>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Ekspor Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Unduh data Anda saat ini dalam format JSON (untuk cadangan penuh) atau CSV (untuk diolah di spreadsheet).
              </p>
              
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold text-base">Cadangan Penuh</h4>
                 <p className="text-xs text-muted-foreground">Unduh satu file berisi semua data (termasuk nama & logo aplikasi). Berguna untuk backup.</p>
                <Button onClick={handleExportJson} variant="secondary" disabled={isLoading}>
                  Ekspor Semua Data (JSON)
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold text-base">Ekspor per Tabel (CSV)</h4>
                <p className="text-xs text-muted-foreground">Unduh data spesifik untuk dianalisis di Excel atau sejenisnya.</p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => exportDataAsCsv(sales, 'penjualan.csv', processSalesForCsv)} variant="outline" disabled={isLoading}>Penjualan</Button>
                  <Button onClick={() => exportDataAsCsv(drinks, 'minuman.csv', processProductsForCsv)} variant="outline" disabled={isLoading}>Minuman</Button>
                  <Button onClick={() => exportDataAsCsv(foods, 'makanan.csv', processProductsForCsv)} variant="outline" disabled={isLoading}>Makanan</Button>
                  <Button onClick={() => exportDataAsCsv(rawMaterials, 'bahan_baku.csv')} variant="outline" disabled={isLoading}>Bahan Baku</Button>
                  <Button onClick={() => exportDataAsCsv(operationalCosts, 'biaya_operasional.csv')} variant="outline" disabled={isLoading}>Biaya Operasional</Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings} disabled={!hasChanges}>
              Simpan Pengaturan
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
