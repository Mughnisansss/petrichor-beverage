"use client";

import React from "react";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";

export default function PengaturanPage() {
  const { toast } = useToast();
  const { drinks, sales, rawMaterials, operationalCosts, isLoading } = useAppContext();

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
      drinks,
      sales,
      rawMaterials,
      operationalCosts,
    };
    downloadFile(JSON.stringify(allData, null, 2), "petrichor_backup.json", "application/json");
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
                // Flatten nested objects/arrays for CSV
                cell = JSON.stringify(cell);
            }
            const cellString = String(cell).replace(/"/g, '""'); // Escape double quotes
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
      const drink = drinks.find(d => d.id === sale.drinkId);
      return {
        id: sale.id,
        tanggal: sale.date,
        nama_minuman: drink?.name || 'ID tidak ditemukan',
        jumlah: sale.quantity,
        diskon_persen: sale.discount,
        total_pendapatan: drink ? drink.sellingPrice * sale.quantity * (1 - sale.discount / 100) : 0,
      }
    });
  }

  const processDrinksForCsv = (drinksData: typeof drinks) => {
    return drinksData.map(drink => {
      const ingredientsString = drink.ingredients.map(ing => {
        const material = rawMaterials.find(m => m.id === ing.rawMaterialId);
        return `${material?.name || '?'}:${ing.quantity}${material?.unit || ''}`;
      }).join('; ');
      return {
        id: drink.id,
        nama_minuman: drink.name,
        harga_pokok: drink.costPrice,
        harga_jual: drink.sellingPrice,
        resep: ingredientsString,
      }
    });
  }

  return (
    <MainLayout>
      <div className="flex justify-center items-start pt-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Pengaturan Aplikasi</CardTitle>
            <CardDescription>
              Kelola pengaturan umum dan data aplikasi Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Ekspor Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Unduh semua data aplikasi dalam format JSON (untuk cadangan penuh) atau CSV (untuk diolah di spreadsheet).
              </p>
              
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold text-base">Cadangan Penuh</h4>
                 <p className="text-xs text-muted-foreground">Unduh satu file berisi semua data. Berguna untuk backup.</p>
                <Button onClick={handleExportJson} variant="secondary" disabled={isLoading}>
                  Ekspor Semua Data (JSON)
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold text-base">Ekspor per Tabel (CSV)</h4>
                <p className="text-xs text-muted-foreground">Unduh data spesifik untuk dianalisis di Excel atau sejenisnya.</p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => exportDataAsCsv(sales, 'penjualan.csv', processSalesForCsv)} variant="outline" disabled={isLoading}>Penjualan</Button>
                  <Button onClick={() => exportDataAsCsv(drinks, 'minuman.csv', processDrinksForCsv)} variant="outline" disabled={isLoading}>Minuman</Button>
                  <Button onClick={() => exportDataAsCsv(rawMaterials, 'bahan_baku.csv')} variant="outline" disabled={isLoading}>Bahan Baku</Button>
                  <Button onClick={() => exportDataAsCsv(operationalCosts, 'biaya_operasional.csv')} variant="outline" disabled={isLoading}>Biaya Operasional</Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Mode Penyimpanan</h3>
              <p className="text-sm text-muted-foreground">
                Aplikasi ini saat ini menyimpan data di server dalam file `db.json`. Opsi untuk beralih ke Local Storage atau Database Cloud sedang dalam pengembangan.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
