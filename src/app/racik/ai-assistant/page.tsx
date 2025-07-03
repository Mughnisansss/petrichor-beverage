"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { generateRecipe, type GenerateRecipeOutput } from '@/ai/flows/recipe-generator-flow';

export default function AiAssistantPage() {
  const { rawMaterials } = useAppContext();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<GenerateRecipeOutput | null>(null);

  const handleGenerateRecipe = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Kosong',
        description: 'Harap masukkan ide resep Anda.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setRecipe(null);

    try {
      // We only need name and unit for the prompt
      const availableMaterials = rawMaterials.map(({ name, unit }) => ({ name, unit }));
      const result = await generateRecipe({
        prompt,
        rawMaterials: availableMaterials,
      });
      setRecipe(result);
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: 'Gagal Membuat Resep',
        description: (error as Error).message || 'Terjadi kesalahan pada AI. Coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Asisten Resep AI</h1>
        <p className="text-muted-foreground">
          Butuh inspirasi? Jelaskan ide Anda dan biarkan AI membuatkan resep baru untuk menu Anda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generator Resep</CardTitle>
          <CardDescription>
            Contoh: "Minuman kopi dingin dengan sentuhan rasa buah tropis" atau "Cemilan gurih yang cocok untuk teman ngopi".
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Masukkan ide resep Anda di sini..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            disabled={isLoading}
          />
          <Button onClick={handleGenerateRecipe} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Buat Resep
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">AI sedang meracik ide Anda... Harap tunggu sebentar.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {recipe && (
        <Card>
          <CardHeader>
            <CardTitle>{recipe.name}</CardTitle>
            <CardDescription>{recipe.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Bahan-Bahan:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index}>
                    {ing.name} - {ing.quantity} {ing.unit}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Instruksi:</h3>
              <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                {recipe.instructions}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
