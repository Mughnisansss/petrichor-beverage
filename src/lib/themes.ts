/**
 * Theme System for Petrichor
 * Defines multiple F&B-themed color palettes and styling configurations
 */

export interface ThemeColors {
  background: string;      // HSL values
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
}

export interface ThemeFonts {
  body: string;
  headline: string;
  accent: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  borderRadius: string;
  defaultMarqueeText: string;
  icon: string;
}

export const themes: Record<string, ThemeConfig> = {
  // Default Petrichor Theme (Sky Blue)
  default: {
    id: 'default',
    name: 'Petrichor Default',
    description: 'The classic sky blue theme, fresh as rain on earth',
    category: 'general',
    colors: {
      background: '210 100% 97%',
      foreground: '210 13% 20%',
      card: '210 100% 100%',
      cardForeground: '210 13% 20%',
      popover: '210 100% 100%',
      popoverForeground: '210 13% 20%',
      primary: '197 71% 73%',
      primaryForeground: '210 13% 15%',
      secondary: '210 31% 52%',
      secondaryForeground: '210 100% 98%',
      muted: '210 50% 94%',
      mutedForeground: '210 15% 45%',
      accent: '210 31% 52%',
      accentForeground: '210 100% 98%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      border: '210 20% 88%',
      input: '210 20% 88%',
      ring: '197 71% 73%',
      chart1: '210 31% 52%',
      chart2: '197 71% 73%',
    },
    fonts: {
      body: "'Inter', sans-serif",
      headline: "'Inter', sans-serif",
      accent: "'Pacifico', cursive",
    },
    borderRadius: '0.5rem',
    defaultMarqueeText: 'Welcome to {appName}! Fresh drinks, great vibes!',
    icon: '☁️',
  },

  // Coffee Theme
  coffee: {
    id: 'coffee',
    name: 'Coffee House',
    description: 'Rich, warm coffee tones for your café',
    category: 'beverage',
    colors: {
      background: '30 20% 98%',      // Warm cream
      foreground: '25 30% 15%',      // Dark coffee
      card: '30 15% 96%',            // Light cream
      cardForeground: '25 30% 15%',
      popover: '30 15% 96%',
      popoverForeground: '25 30% 15%',
      primary: '25 65% 45%',          // Rich coffee brown
      primaryForeground: '30 20% 98%',
      secondary: '30 50% 35%',        // Darker coffee
      secondaryForeground: '30 20% 98%',
      muted: '30 25% 90%',            // Light coffee
      mutedForeground: '25 25% 35%',
      accent: '30 70% 50%',           // Medium coffee
      accentForeground: '30 20% 98%',
      destructive: '0 70% 55%',
      destructiveForeground: '30 20% 98%',
      border: '25 20% 85%',
      input: '25 20% 85%',
      ring: '25 65% 45%',
      chart1: '25 65% 45%',
      chart2: '30 50% 35%',
    },
    fonts: {
      body: "'Inter', sans-serif",
      headline: "'Playfair Display', serif",
      accent: "'Pacifico', cursive",
    },
    borderRadius: '0.75rem',
    defaultMarqueeText: '☕ Fresh brewed coffee at {appName}!',
    icon: '☕',
  },

  // Burger Theme
  burger: {
    id: 'burger',
    name: 'Burger Joint',
    description: 'Bold, appetizing colors for burger places',
    category: 'food',
    colors: {
      background: '15 30% 96%',       // Warm off-white
      foreground: '15 40% 15%',       // Dark brown
      card: '15 20% 95%',            // Light cream
      cardForeground: '15 40% 15%',
      popover: '15 20% 95%',
      popoverForeground: '15 40% 15%',
      primary: '15 80% 55%',          // Burger bun orange-brown
      primaryForeground: '15 30% 98%',
      secondary: '15 60% 40%',        // Darker brown
      secondaryForeground: '15 30% 98%',
      muted: '15 25% 90%',            // Light brown
      mutedForeground: '15 30% 35%',
      accent: '35 90% 60%',           // Bright orange
      accentForeground: '15 30% 98%',
      destructive: '0 75% 55%',
      destructiveForeground: '15 30% 98%',
      border: '15 20% 85%',
      input: '15 20% 85%',
      ring: '15 80% 55%',
      chart1: '15 80% 55%',
      chart2: '35 90% 60%',
    },
    fonts: {
      body: "'Inter', sans-serif",
      headline: "'Oswald', sans-serif",
      accent: "'Bangers', cursive",
    },
    borderRadius: '0.25rem',
    defaultMarqueeText: '🍔 Best burgers in town at {appName}!',
    icon: '🍔',
  },

  // Dessert Theme
  dessert: {
    id: 'dessert',
    name: 'Sweet Delights',
    description: 'Soft, pastel colors for dessert shops',
    category: 'dessert',
    colors: {
      background: '340 30% 98%',      // Soft pink-white
      foreground: '340 40% 20%',      // Dark pink
      card: '340 20% 97%',            // Light pink
      cardForeground: '340 40% 20%',
      popover: '340 20% 97%',
      popoverForeground: '340 40% 20%',
      primary: '340 75% 65%',         // Pink
      primaryForeground: '340 30% 98%',
      secondary: '340 50% 45%',        // Darker pink
      secondaryForeground: '340 30% 98%',
      muted: '340 25% 92%',            // Light pink
      mutedForeground: '340 30% 40%',
      accent: '280 70% 65%',           // Purple accent
      accentForeground: '340 30% 98%',
      destructive: '0 70% 55%',
      destructiveForeground: '340 30% 98%',
      border: '340 20% 85%',
      input: '340 20% 85%',
      ring: '340 75% 65%',
      chart1: '340 75% 65%',
      chart2: '280 70% 65%',
    },
    fonts: {
      body: "'Inter', sans-serif",
      headline: "'Dancing Script', cursive",
      accent: "'Pacifico', cursive",
    },
    borderRadius: '1rem',
    defaultMarqueeText: '🍰 Sweet treats at {appName}!',
    icon: '🍰',
  },

  // Meatballs Theme
  meatballs: {
    id: 'meatballs',
    name: 'Meatball House',
    description: 'Hearty, savory colors for comfort food',
    category: 'food',
    colors: {
      background: '20 25% 96%',       // Warm cream
      foreground: '20 35% 18%',       // Dark brown
      card: '20 15% 95%',            // Light cream
      cardForeground: '20 35% 18%',
      popover: '20 15% 95%',
      popoverForeground: '20 35% 18%',
      primary: '20 70% 50%',          // Rich brown
      primaryForeground: '20 25% 98%',
      secondary: '20 55% 35%',        // Darker brown
      secondaryForeground: '20 25% 98%',
      muted: '20 25% 90%',            // Light brown
      mutedForeground: '20 30% 35%',
      accent: '45 85% 55%',           // Golden yellow
      accentForeground: '20 25% 98%',
      destructive: '0 70% 55%',
      destructiveForeground: '20 25% 98%',
      border: '20 20% 85%',
      input: '20 20% 85%',
      ring: '20 70% 50%',
      chart1: '20 70% 50%',
      chart2: '45 85% 55%',
    },
    fonts: {
      body: "'Inter', sans-serif",
      headline: "'Merriweather', serif",
      accent: "'Permanent Marker', cursive",
    },
    borderRadius: '0.5rem',
    defaultMarqueeText: '🍝 Homemade meatballs at {appName}!',
    icon: '🍝',
  },

  // Bubble Tea Theme
  bubbletea: {
    id: 'bubbletea',
    name: 'Bubble Tea Shop',
    description: 'Fun, vibrant colors for bubble tea places',
    category: 'beverage',
    colors: {
      background: '180 20% 96%',      // Minty white
      foreground: '180 40% 18%',      // Dark teal
      card: '180 15% 95%',            // Light mint
      cardForeground: '180 40% 18%',
      popover: '180 15% 95%',
      popoverForeground: '180 40% 18%',
      primary: '180 70% 50%',         // Teal
      primaryForeground: '180 20% 98%',
      secondary: '180 50% 35%',        // Darker teal
      secondaryForeground: '180 20% 98%',
      muted: '180 25% 90%',            // Light teal
      mutedForeground: '180 30% 40%',
      accent: '320 85% 65%',           // Pink accent
      accentForeground: '180 20% 98%',
      destructive: '0 70% 55%',
      destructiveForeground: '180 20% 98%',
      border: '180 20% 85%',
      input: '180 20% 85%',
      ring: '180 70% 50%',
      chart1: '180 70% 50%',
      chart2: '320 85% 65%',
    },
    fonts: {
      body: "'Inter', sans-serif",
      headline: "'Fredoka One', cursive",
      accent: "'Pacifico', cursive",
    },
    borderRadius: '1.5rem',
    defaultMarqueeText: '🧋 Bubble tea paradise at {appName}!',
    icon: '🧋',
  },

  // Bakery Theme
  bakery: {
    id: 'bakery',
    name: 'Artisan Bakery',
    description: 'Warm, golden colors for fresh bakeries',
    category: 'food',
    colors: {
      background: '45 30% 96%',       // Warm cream
      foreground: '35 40% 18%',       // Dark brown
      card: '45 20% 95%',            // Light golden
      cardForeground: '35 40% 18%',
      popover: '45 20% 95%',
      popoverForeground: '35 40% 18%',
      primary: '35 75% 50%',          // Golden brown
      primaryForeground: '45 25% 98%',
      secondary: '35 55% 35%',        // Darker brown
      secondaryForeground: '45 25% 98%',
      muted: '40 25% 90%',            // Light golden
      mutedForeground: '35 30% 35%',
      accent: '45 90% 60%',           // Bright golden
      accentForeground: '35 25% 98%',
      destructive: '0 70% 55%',
      destructiveForeground: '45 25% 98%',
      border: '35 20% 85%',
      input: '35 20% 85%',
      ring: '35 75% 50%',
      chart1: '35 75% 50%',
      chart2: '45 90% 60%',
    },
    fonts: {
      body: "'Inter', sans-serif",
      headline: "'Lora', serif",
      accent: "'Great Vibes', cursive",
    },
    borderRadius: '0.5rem',
    defaultMarqueeText: '🥐 Fresh baked goods at {appName}!',
    icon: '🥐',
  },

  // Healthy/Juice Theme
  healthy: {
    id: 'healthy',
    name: 'Fresh & Healthy',
    description: 'Fresh, natural colors for juice and health bars',
    category: 'beverage',
    colors: {
      background: '120 25% 96%',      // Fresh green-white
      foreground: '120 30% 18%',      // Dark green
      card: '120 20% 95%',            // Light green
      cardForeground: '120 30% 18%',
      popover: '120 20% 95%',
      popoverForeground: '120 30% 18%',
      primary: '140 65% 45%',         // Fresh green
      primaryForeground: '120 25% 98%',
      secondary: '140 45% 30%',        // Darker green
      secondaryForeground: '120 25% 98%',
      muted: '120 25% 90%',            // Light green
      mutedForeground: '120 30% 40%',
      accent: '30 85% 60%',           // Orange accent
      accentForeground: '120 25% 98%',
      destructive: '0 70% 55%',
      destructiveForeground: '120 25% 98%',
      border: '120 20% 85%',
      input: '120 20% 85%',
      ring: '140 65% 45%',
      chart1: '140 65% 45%',
      chart2: '30 85% 60%',
    },
    fonts: {
      body: "'Inter', sans-serif",
      headline: "'Poppins', sans-serif",
      accent: "'Sacramento', cursive",
    },
    borderRadius: '1rem',
    defaultMarqueeText: '🥤 Fresh juices at {appName}!',
    icon: '🥤',
  },

  // Pizza Theme
  pizza: {
    id: 'pizza',
    name: 'Pizza Paradise',
    description: 'Bold Italian colors for pizzerias',
    category: 'food',
    colors: {
      background: '30 30% 96%',       // Warm cream
      foreground: '15 40% 18%',       // Dark red-brown
      card: '30 20% 95%',            // Light cream
      cardForeground: '15 40% 18%',
      popover: '30 20% 95%',
      popoverForeground: '15 40% 18%',
      primary: '15 80% 55%',          // Italian red
      primaryForeground: '30 25% 98%',
      secondary: '30 50% 35%',        // Darker brown
      secondaryForeground: '30 25% 98%',
      muted: '30 25% 90%',            // Light brown
      mutedForeground: '30 30% 35%',
      accent: '45 90% 55%',           // Cheese yellow
      accentForeground: '30 25% 98%',
      destructive: '0 70% 55%',
      destructiveForeground: '30 25% 98%',
      border: '30 20% 85%',
      input: '30 20% 85%',
      ring: '15 80% 55%',
      chart1: '15 80% 55%',
      chart2: '45 90% 55%',
    },
    fonts: {
      body: "'Inter', sans-serif",
      headline: "'Abril Fatface', cursive",
      accent: "'Bangers', cursive",
    },
    borderRadius: '0.75rem',
    defaultMarqueeText: '🍕 Authentic pizza at {appName}!',
    icon: '🍕',
  },

  // Ice Cream Theme
  icecream: {
    id: 'icecream',
    name: 'Ice Cream Parlor',
    description: 'Cool, sweet colors for ice cream shops',
    category: 'dessert',
    colors: {
      background: '200 30% 96%',      // Cool blue-white
      foreground: '200 40% 20%',      // Dark blue
      card: '200 20% 95%',            // Light blue
      cardForeground: '200 40% 20%',
      popover: '200 20% 95%',
      popoverForeground: '200 40% 20%',
      primary: '200 75% 60%',         // Sky blue
      primaryForeground: '200 25% 98%',
      secondary: '200 50% 40%',        // Darker blue
      secondaryForeground: '200 25% 98%',
      muted: '200 25% 90%',            // Light blue
      mutedForeground: '200 30% 40%',
      accent: '320 75% 65%',           // Pink accent
      accentForeground: '200 25% 98%',
      destructive: '0 70% 55%',
      destructiveForeground: '200 25% 98%',
      border: '200 20% 85%',
      input: '200 20% 85%',
      ring: '200 75% 60%',
      chart1: '200 75% 60%',
      chart2: '320 75% 65%',
    },
    fonts: {
      body: "'Inter', sans-serif",
      headline: "'Fredoka One', cursive",
      accent: "'Pacifico', cursive",
    },
    borderRadius: '1.25rem',
    defaultMarqueeText: '🍦 Cool treats at {appName}!',
    icon: '🍦',
  },
};

export const getThemeById = (id: string): ThemeConfig => {
  return themes[id] || themes.default;
};

export const getThemesByCategory = (category: string): ThemeConfig[] => {
  return Object.values(themes).filter(theme => theme.category === category);
};

export const getAllThemes = (): ThemeConfig[] => {
  return Object.values(themes);
};