"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

const suggestionSchema = z.object({
  costPrice: z.coerce.number().min(0, "Harga pokok tidak boleh negatif"),
  profitMargin: z.coerce.number().min(0, "Margin keuntungan tidak boleh negatif"),
});

type SuggestionValues = z.infer<typeof suggestionSchema>;

interface SuggestionResult {
  sellingPrice: number;
  profitPerSale: number;
}

export default function SaranHargaPage() {
  const [result, setResult] = useState<SuggestionResult | null>(null);

  const form = useForm<SuggestionValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: { costPrice: 0, profitMargin: 50 },
  });

  function onSubmit(values: SuggestionValues) {
    const { costPrice, profitMargin } = values;
    if (profitMargin >= 100) {
        form.setError("profitMargin", {
            type: "manual",
            message: "Margin tidak bisa 100% atau lebih",
        });
        setResult(null);
        return;
    }
    const sellingPrice = costPrice / (1 - (profitMargin / 100));
    const profitPerSale = sellingPrice - costPrice;
    setResult({ sellingPrice, profitPerSale });
  }
  
  return (
    <MainLayout>
      <div className="flex justify-center items-start pt-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Kalkulator Saran Harga</CardTitle>
            <CardDescription>Hitung harga jual ideal berdasarkan harga pokok dan margin keuntungan yang Anda inginkan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onChange={() => form.handleSubmit(onSubmit)()} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Pokok (HPP)</FormLabel>
                      <FormControl><Input type="number" {...field} placeholder="Masukkan harga pokok" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profitMargin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Margin Laba Diinginkan (%)</FormLabel>
                      <FormControl><Input type="number" {...field} placeholder="cth: 50" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            
            {result && (
              <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Hasil Rekomendasi</h3>
                  <div className="space-y-2">
                      <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Saran Harga Jual</span>
                          <span className="text-xl font-bold text-primary">{formatCurrency(result.sellingPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Laba per Penjualan</span>
                          <span className="font-semibold">{formatCurrency(result.profitPerSale)}</span>
                      </div>
                  </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}