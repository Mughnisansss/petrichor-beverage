
"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { ImageIcon, Upload, Trash2, UploadCloud, Download, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Papa from "papaparse";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function PengaturanPage() {
  const { toast } = useToast();
  const { 
    drinks, foods, sales, rawMaterials, operationalCosts, 
    isLoading, storageMode, setStorageMode, appName, setAppName,
    logoImageUri, setLogoImageUri, marqueeText, setMarqueeText,
    importData, initialCapital, cashExpenses,
    importRawMaterialsFromCsv, importOperationalCostsFromCsv
  } = useAppContext();

  const [selectedMode, setSelectedMode] = useState(storageMode);
  const [localAppName, setLocalAppName] = useState(appName);
  const [localMarqueeText, setLocalMarqueeText] = useState(marqueeText);
  const [preview, setPreview] = useState<string | null>(logoImageUri);
  const [fileToImport, setFileToImport] = useState<File | null>(null);

  useEffect(() => {
    setSelectedMode(storageMode);
    setLocalAppName(appName);
    setPreview(logoImageUri);
    setLocalMarqueeText(marqueeText);
  }, [storageMode, appName, logoImageUri, marqueeText]);

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
    if (selectedMode !== storageMode) {
      setStorageMode(selectedMode);
      changesMade.push("Mode penyimpanan diubah.");
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
    toast({ title: "Ekspor Berhasil", description: `${filename} telah diunduh.` });
  };

  const handleExportJson = () => {
    if (isLoading) {
      toast({ title: "Harap tunggu", description: "Data sedang dimuat." });
      return;
    }
    const allData = { appName, logoImageUri, marqueeText, initialCapital, cashExpenses, drinks, foods, sales, rawMaterials, operationalCosts };
    const filename = `${appName.toLowerCase().replace(/\s/g, '_')}_backup_${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(JSON.stringify(allData, null, 2), filename, "application/json");
  };

  const convertToCsv = (data: Record<string, any>[]) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
        const values = headers.map(header => {
            let cell = row[header];
            if (cell === null || cell === undefined) cell = '';
            else if (typeof cell === 'object') cell = JSON.stringify(cell);
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
  };

  const processSalesForCsv = (salesData: typeof sales) => {
    return salesData.map(sale => {
      const product = sale.productType === 'drink' ? drinks.find(d => d.id === sale.productId) : foods.find(f => f.id === sale.productId);
      const toppingsString = (sale.selectedToppings || []).map(t => rawMaterials.find(m => m.id === t.rawMaterialId)?.name || 'N/A').join('; ');
      return { id: sale.id, tanggal: sale.date, tipe_produk: sale.productType, nama_produk: product?.name || 'ID tidak ditemukan', jumlah: sale.quantity, diskon_persen: sale.discount, total_pendapatan: sale.totalSalePrice, toppings: toppingsString };
    });
  };

  const processProductsForCsv = (productsData: typeof drinks | typeof foods) => {
    return productsData.map(product => {
      const ingredientsString = product.ingredients.map(ing => { const material = rawMaterials.find(m => m.id === ing.rawMaterialId); return `${material?.name || '?'}:${ing.quantity}${material?.unit || ''}`; }).join('; ');
      return { id: product.id, nama_produk: product.name, harga_pokok: product.costPrice, harga_jual: product.sellingPrice, resep: ingredientsString };
    });
  };

  const handleImportJson = async () => {
    if (!fileToImport) {
      toast({ title: "Tidak Ada File", description: "Pilih file backup .json terlebih dahulu.", variant: "destructive" });
      return;
    }
    if (!window.confirm("Yakin ingin mengimpor data? Tindakan ini akan MENIMPA semua data aplikasi yang ada saat ini dan tidak dapat dibatalkan.")) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Gagal membaca file.");
        const data = JSON.parse(text);
        const result = await importData(data);
        if (result.ok) {
          toast({ title: "Impor Berhasil", description: "Data Anda telah berhasil dipulihkan. Halaman akan dimuat ulang." });
          setFileToImport(null);
          window.location.reload(); 
        } else {
          throw new Error(result.message || "Gagal mengimpor data.");
        }
      } catch (error) {
        toast({ title: "Error Saat Impor", description: `Gagal memproses file. Pastikan file backup valid. Error: ${(error as Error).message}`, variant: "destructive" });
      }
    };
    reader.readAsText(fileToImport);
  };
  
  const handleImportCsv = (file: File | null, importFunction: (data: any[]) => Promise<any>, dataType: string) => {
    if (!file) {
      toast({ title: `Pilih File CSV`, description: `Silakan pilih file CSV untuk ${dataType}.`, variant: "destructive" });
      return;
    }
    if (!window.confirm(`Yakin ingin menambah data ${dataType} dari CSV? Data ini akan DITAMBAHKAN ke data yang sudah ada.`)) return;
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.errors.length > 0) {
          toast({ title: "Error Parsing CSV", description: `Gagal membaca file CSV. Error: ${results.errors[0].message}`, variant: "destructive" });
          return;
        }
        try {
          await importFunction(results.data);
          toast({ title: "Impor CSV Berhasil", description: `Data ${dataType} telah berhasil ditambahkan.` });
        } catch (error) {
          toast({ title: "Error Saat Impor CSV", description: (error as Error).message, variant: "destructive" });
        }
      }
    });
  };

  const hasChanges = (selectedMode !== storageMode) || (localAppName.trim() && localAppName.trim() !== appName) || (localMarqueeText.trim() && localMarqueeText.trim() !== marqueeText);

  // States for CSV file inputs
  const [bahanBakuCsv, setBahanBakuCsv] = useState<File|null>(null);
  const [operasionalCsv, setOperasionalCsv] = useState<File|null>(null);

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
                <Input id="appName" value={localAppName} onChange={(e) => setLocalAppName(e.target.value)} placeholder="Masukkan nama aplikasi/toko Anda" />
                <p className="text-sm text-muted-foreground">Nama ini akan muncul sebagai logo dan di beberapa judul halaman.</p>
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
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Mode Penyimpanan Data</h3>
              <RadioGroup value={selectedMode} onValueChange={(value) => setSelectedMode(value as "local" | "server")} className="space-y-2">
                <div><div className="flex items-center space-x-2"><RadioGroupItem value="local" id="local" /><Label htmlFor="local">Penyimpanan Browser (Lokal)</Label></div><p className="text-xs text-muted-foreground pl-6">Data disimpan hanya di browser ini. Cocok untuk penggunaan pribadi dan offline.</p></div>
                <div><div className="flex items-center space-x-2"><RadioGroupItem value="server" id="server" /><Label htmlFor="server">Penyimpanan Server (Mode Demo)</Label></div><p className="text-xs text-muted-foreground pl-6">Mode pengembangan. Data disimpan di `db.json`. **Tidak untuk produksi.**</p></div>
              </RadioGroup>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Manajemen Data</h3>
              <p className="text-sm text-muted-foreground mb-4">Impor atau ekspor data aplikasi Anda. Berguna untuk backup atau migrasi.</p>
              
              <div className="p-4 border rounded-lg space-y-4">
                <h4 className="font-semibold text-base">Backup & Restore (JSON)</h4>
                <p className="text-sm text-muted-foreground">Gunakan format JSON untuk backup lengkap yang dapat dipulihkan. <strong className="text-destructive">Mengimpor akan menimpa semua data yang ada.</strong></p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                      <Label htmlFor="importFile" className="text-xs font-semibold">IMPOR DARI BACKUP</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                          <Label htmlFor="importFile" className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}><UploadCloud className="mr-2 h-4 w-4" /> Pilih File JSON...</Label>
                          <Input id="importFile" type="file" accept=".json" onChange={(e) => setFileToImport(e.target.files?.[0] || null)} className="hidden" />
                          <Button onClick={handleImportJson} disabled={!fileToImport || isLoading}>Impor</Button>
                      </div>
                      {fileToImport && <p className="text-xs text-muted-foreground">File dipilih: <strong>{fileToImport.name}</strong></p>}
                  </div>
                  <div className="flex-1 space-y-2">
                      <Label className="text-xs font-semibold">BUAT FILE BACKUP</Label>
                      <div>
                        <Button onClick={handleExportJson} variant="secondary" disabled={isLoading} className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Ekspor Semua Data (JSON)</Button>
                      </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg space-y-4">
                <h4 className="font-semibold text-base">Analisis & Tambah Massal (CSV)</h4>
                <p className="text-sm text-muted-foreground">Gunakan format CSV untuk diolah di spreadsheet atau untuk menambahkan data baru secara massal.</p>
                <div className="space-y-3">
                  {/* CSV Row: Bahan Baku */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50">
                    <Label className="font-medium">Bahan Baku</Label>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <Button onClick={() => handleImportCsv(bahanBakuCsv, importRawMaterialsFromCsv, 'Bahan Baku')} variant="outline" size="sm" disabled={isLoading}>Impor dari CSV</Button>
                      <Input type="file" accept=".csv" onChange={(e) => setBahanBakuCsv(e.target.files?.[0] || null)} className="text-xs file:mr-2 file:text-xs file:h-full file:rounded-md file:border-0 file:bg-muted file:px-2 w-48 h-9" />
                      <Button onClick={() => exportDataAsCsv(rawMaterials, 'bahan_baku.csv')} variant="outline" size="sm" disabled={isLoading}>Ekspor</Button>
                    </div>
                  </div>
                  {/* CSV Row: Biaya Operasional */}
                   <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50">
                    <Label className="font-medium">Biaya Operasional</Label>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <Button onClick={() => handleImportCsv(operasionalCsv, importOperationalCostsFromCsv, 'Biaya Operasional')} variant="outline" size="sm" disabled={isLoading}>Impor dari CSV</Button>
                      <Input type="file" accept=".csv" onChange={(e) => setOperasionalCsv(e.target.files?.[0] || null)} className="text-xs file:mr-2 file:text-xs file:h-full file:rounded-md file:border-0 file:bg-muted file:px-2 w-48 h-9" />
                      <Button onClick={() => exportDataAsCsv(operationalCosts, 'biaya_operasional.csv')} variant="outline" size="sm" disabled={isLoading}>Ekspor</Button>
                    </div>
                  </div>
                  <Separator />
                  <p className="text-xs text-muted-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Impor CSV untuk Penjualan & Produk dinonaktifkan untuk menjaga integritas data resep dan transaksi. Gunakan fitur Backup & Restore JSON.</p>
                  {/* CSV Row: Penjualan (Disabled) */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2 rounded-md opacity-50">
                    <Label className="font-medium">Penjualan</Label>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" disabled>Impor dari CSV</Button></TooltipTrigger><TooltipContent><p>Gunakan Restore JSON untuk impor penjualan.</p></TooltipContent></Tooltip></TooltipProvider>
                      <Button onClick={() => exportDataAsCsv(sales, 'penjualan.csv', processSalesForCsv)} variant="outline" size="sm" disabled={isLoading}>Ekspor</Button>
                    </div>
                  </div>
                  {/* CSV Row: Minuman (Disabled) */}
                   <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2 rounded-md opacity-50">
                    <Label className="font-medium">Minuman</Label>
                    <div className="flex gap-2 flex-wrap justify-end">
                       <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" disabled>Impor dari CSV</Button></TooltipTrigger><TooltipContent><p>Gunakan Restore JSON untuk impor produk.</p></TooltipContent></Tooltip></TooltipProvider>
                      <Button onClick={() => exportDataAsCsv(drinks, 'minuman.csv', processProductsForCsv)} variant="outline" size="sm" disabled={isLoading}>Ekspor</Button>
                    </div>
                  </div>
                   {/* CSV Row: Makanan (Disabled) */}
                   <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2 rounded-md opacity-50">
                    <Label className="font-medium">Makanan</Label>
                    <div className="flex gap-2 flex-wrap justify-end">
                       <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" disabled>Impor dari CSV</Button></TooltipTrigger><TooltipContent><p>Gunakan Restore JSON untuk impor produk.</p></TooltipContent></Tooltip></TooltipProvider>
                      <Button onClick={() => exportDataAsCsv(foods, 'makanan.csv', processProductsForCsv)} variant="outline" size="sm" disabled={isLoading}>Ekspor</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings} disabled={!hasChanges}>Simpan Pengaturan</Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
