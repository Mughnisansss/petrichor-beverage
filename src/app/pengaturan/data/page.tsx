"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { UploadCloud, Download, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Papa from "papaparse";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function DataPengaturanPage() {
    const { toast } = useToast();
    const { 
        drinks, foods, sales, rawMaterials, operationalCosts, 
        isLoading, storageMode, setStorageMode, appName,
        importData, initialCapital, cashExpenses, logoImageUri, marqueeText,
        importRawMaterialsFromCsv, importOperationalCostsFromCsv
    } = useAppContext();

    const [selectedMode, setSelectedMode] = useState(storageMode);
    const [fileToImport, setFileToImport] = useState<File | null>(null);
    const [bahanBakuCsv, setBahanBakuCsv] = useState<File|null>(null);
    const [operasionalCsv, setOperasionalCsv] = useState<File|null>(null);
    
    useEffect(() => {
        setSelectedMode(storageMode);
    }, [storageMode]);

    const hasChanges = selectedMode !== storageMode;
    
    const handleSaveSettings = () => {
        if (selectedMode !== storageMode) {
          setStorageMode(selectedMode);
          toast({ title: "Pengaturan Disimpan", description: "Mode penyimpanan telah diubah." });
        }
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

    const CsvActionRow = ({ label, description, onImport, onExport, onFileChange, isDisabled, isExportDisabled }: any) => (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="flex-grow">
                <Label className="font-semibold text-base">{label}</Label>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                {!isDisabled ? (
                    <>
                    <Button onClick={onImport} variant="outline" size="sm" className="w-full sm:w-auto">Impor</Button>
                    <Input type="file" accept=".csv" onChange={onFileChange} className="text-xs file:mr-2 file:text-xs file:h-9 file:rounded-md file:border-0 file:bg-muted file:px-2 w-full sm:w-56" />
                    </>
                ) : (
                    <TooltipProvider><Tooltip><TooltipTrigger asChild>
                        <div className="w-full sm:w-auto"><Button variant="outline" size="sm" disabled className="w-full">Impor</Button></div>
                    </TooltipTrigger><TooltipContent><p>Gunakan Restore JSON untuk impor data ini.</p></TooltipContent></Tooltip></TooltipProvider>
                )}
                 <Button onClick={onExport} variant="outline" size="sm" disabled={isExportDisabled} className="w-full sm:w-auto">Ekspor</Button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Mode Penyimpanan Data</CardTitle>
                    <CardDescription>Pilih di mana data aplikasi Anda akan disimpan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={selectedMode} onValueChange={(value) => setSelectedMode(value as "local" | "server")} className="space-y-2">
                        <div><div className="flex items-center space-x-2"><RadioGroupItem value="local" id="local" /><Label htmlFor="local">Penyimpanan Browser (Lokal)</Label></div><p className="text-xs text-muted-foreground pl-6">Data disimpan hanya di browser ini. Cocok untuk penggunaan pribadi dan offline.</p></div>
                        <div><div className="flex items-center space-x-2"><RadioGroupItem value="server" id="server" /><Label htmlFor="server">Penyimpanan Server (Mode Demo)</Label></div><p className="text-xs text-muted-foreground pl-6">Mode pengembangan. Data disimpan di `db.json`. **Tidak untuk produksi.**</p></div>
                    </RadioGroup>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveSettings} disabled={!hasChanges}>Simpan Mode</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Manajemen Data</CardTitle>
                    <CardDescription>Impor atau ekspor data aplikasi Anda. Berguna untuk backup atau migrasi.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 border rounded-lg space-y-4">
                        <h4 className="font-semibold text-base">Backup & Restore (JSON)</h4>
                        <p className="text-sm text-muted-foreground">Gunakan format JSON untuk backup lengkap yang dapat dipulihkan. <strong className="text-destructive">Mengimpor akan menimpa semua data yang ada.</strong></p>
                        <div className="flex flex-col md:flex-row gap-4">
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
              
                    <div className="space-y-4">
                        <h4 className="font-semibold text-base">Analisis & Tambah Massal (CSV)</h4>
                        <p className="text-sm text-muted-foreground">Gunakan format CSV untuk diolah di spreadsheet atau untuk menambahkan data baru secara massal.</p>
                        <div className="space-y-3">
                           <CsvActionRow 
                             label="Bahan Baku"
                             description="Tambah / Ekspor data inventaris."
                             onImport={() => handleImportCsv(bahanBakuCsv, importRawMaterialsFromCsv, 'Bahan Baku')}
                             onExport={() => exportDataAsCsv(rawMaterials, 'bahan_baku.csv')}
                             onFileChange={(e: any) => setBahanBakuCsv(e.target.files?.[0] || null)}
                             isExportDisabled={isLoading || rawMaterials.length === 0}
                           />
                           <CsvActionRow 
                             label="Biaya Operasional"
                             description="Tambah / Ekspor biaya rutin."
                             onImport={() => handleImportCsv(operasionalCsv, importOperationalCostsFromCsv, 'Biaya Operasional')}
                             onExport={() => exportDataAsCsv(operationalCosts, 'biaya_operasional.csv')}
                             onFileChange={(e: any) => setOperasionalCsv(e.target.files?.[0] || null)}
                              isExportDisabled={isLoading || operationalCosts.length === 0}
                           />
                           <Separator />
                           <p className="text-xs text-muted-foreground flex items-center gap-2 px-1"><AlertTriangle className="h-4 w-4" /> Impor CSV untuk Penjualan & Produk dinonaktifkan untuk menjaga integritas data. Gunakan fitur Backup & Restore (JSON).</p>
                           <CsvActionRow 
                             label="Penjualan"
                             description="Ekspor riwayat penjualan untuk analisis."
                             isDisabled={true}
                             onExport={() => exportDataAsCsv(sales, 'penjualan.csv', processSalesForCsv)}
                             isExportDisabled={isLoading || sales.length === 0}
                           />
                           <CsvActionRow 
                             label="Minuman"
                             description="Ekspor data resep dan harga minuman."
                             isDisabled={true}
                             onExport={() => exportDataAsCsv(drinks, 'minuman.csv', processProductsForCsv)}
                              isExportDisabled={isLoading || drinks.length === 0}
                           />
                            <CsvActionRow 
                             label="Makanan"
                             description="Ekspor data resep dan harga makanan."
                             isDisabled={true}
                             onExport={() => exportDataAsCsv(foods, 'makanan.csv', processProductsForCsv)}
                             isExportDisabled={isLoading || foods.length === 0}
                           />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
