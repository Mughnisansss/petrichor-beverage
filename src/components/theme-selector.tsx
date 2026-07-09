"use client";

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAppContext } from '@/context/AppContext';
import { getAllThemes, type ThemeConfig } from '@/lib/themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Palette, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeCardProps {
  theme: ThemeConfig;
  isActive: boolean;
  onSelect: () => void;
}

function ThemeCard({ theme, isActive, onSelect }: ThemeCardProps) {
  const colors = theme.colors;
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        isActive && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{theme.icon}</span>
            <div>
              <CardTitle className="text-lg">{theme.name}</CardTitle>
              <CardDescription className="text-xs">{theme.category}</CardDescription>
            </div>
          </div>
          {isActive && (
            <Badge variant="default" className="bg-primary">
              <Check className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {theme.description}
        </p>
        
        {/* Color Preview */}
        <div className="flex gap-2 mb-3">
          <div 
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: `hsl(${colors.primary})` }}
            title="Primary"
          />
          <div 
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: `hsl(${colors.secondary})` }}
            title="Secondary"
          />
          <div 
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: `hsl(${colors.accent})` }}
            title="Accent"
          />
          <div 
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: `hsl(${colors.background})` }}
            title="Background"
          />
        </div>

        {/* Font Preview */}
        <div className="space-y-1 text-xs">
          <div style={{ fontFamily: theme.fonts.headline }}>
            Headline: {theme.fonts.headline.split(',')[0].replace(/'/g, '')}
          </div>
          <div style={{ fontFamily: theme.fonts.body }}>
            Body: {theme.fonts.body.split(',')[0].replace(/'/g, '')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ThemeSelector() {
  const { currentTheme, setTheme, resetTheme } = useTheme();
  const { setThemeId, setMarqueeText, appName } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const allThemes = getAllThemes();
  const categories = ['all', ...Array.from(new Set(allThemes.map(t => t.category)))];
  
  const filteredThemes = selectedCategory === 'all' 
    ? allThemes 
    : allThemes.filter(t => t.category === selectedCategory);

  const handleThemeSelect = (theme: ThemeConfig) => {
    setTheme(theme.id);
    setThemeId(theme.id);
    // Update marquee text with theme default
    const marqueeWithAppName = theme.defaultMarqueeText.replace('{appName}', appName);
    setMarqueeText(marqueeWithAppName);
  };

  const handleResetTheme = () => {
    resetTheme();
    setThemeId('default');
    const defaultTheme = getAllThemes().find(t => t.id === 'default');
    if (defaultTheme) {
      const marqueeWithAppName = defaultTheme.defaultMarqueeText.replace('{appName}', appName);
      setMarqueeText(marqueeWithAppName);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="w-6 h-6" />
            Theme Selection
          </h2>
          <p className="text-muted-foreground mt-1">
            Choose a theme that matches your business style
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleResetTheme}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset to Default
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredThemes.map(theme => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isActive={currentTheme.id === theme.id}
            onSelect={() => handleThemeSelect(theme)}
          />
        ))}
      </div>

      {/* Current Theme Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Current Theme: {currentTheme.name}</CardTitle>
          <CardDescription>
            {currentTheme.icon} {currentTheme.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Category:</span>
              <Badge variant="secondary">{currentTheme.category}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Default Marquee:</span>
              <span className="text-muted-foreground">"{currentTheme.defaultMarqueeText}"</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}