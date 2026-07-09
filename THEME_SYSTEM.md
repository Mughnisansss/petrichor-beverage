# Custom Theme System Implementation

## Overview
I've successfully implemented a comprehensive custom theme system for your Petrichor project with 10 different F&B-themed color schemes and styling options.

## What Was Implemented

### 1. Theme Definitions (`src/lib/themes.ts`)
Created 10 complete themes with unique color palettes, fonts, and styling:

- **Default** - Classic sky blue theme (original Petrichor)
- **Coffee House** - Rich, warm coffee tones with elegant fonts
- **Burger Joint** - Bold, appetizing colors for burger places
- **Sweet Delights** - Soft, pastel colors for dessert shops
- **Meatball House** - Hearty, savory colors for comfort food
- **Bubble Tea Shop** - Fun, vibrant colors for bubble tea places
- **Artisan Bakery** - Warm, golden colors for fresh bakeries
- **Fresh & Healthy** - Fresh, natural colors for juice and health bars
- **Pizza Paradise** - Bold Italian colors for pizzerias
- **Ice Cream Parlor** - Cool, sweet colors for ice cream shops

### 2. Theme Context (`src/context/ThemeContext.tsx`)
- Centralized theme state management
- CSS variable application for dynamic theming
- LocalStorage persistence for theme preferences
- Theme switching functionality

### 3. Theme Selector Component (`src/components/theme-selector.tsx`)
- Beautiful UI for theme selection
- Category filtering (all, beverage, food, dessert)
- Live theme preview with color swatches
- Font preview for each theme
- Current theme information display
- Reset to default functionality

### 4. Integration with Existing System
- Updated `AppContext` to include theme ID in data structure
- Modified main layout to use theme-specific fonts
- Updated logo component to display theme icons
- Enhanced CSS with font variables
- Integrated theme selector into settings page (`/pengaturan/tampilan`)

### 5. Enhanced Styling
- Added Google Fonts for all theme typography
- CSS custom properties for dynamic theming
- Theme-specific border radius values
- Font family variables (body, headline, accent)

## How to Use

### Accessing Theme Selection
1. Navigate to **Settings** → **Tampilan** (`/pengaturan/tampilan`)
2. Browse available themes by category
3. Click on any theme card to apply it
4. The theme will be applied immediately and persist across sessions

### Theme Features
Each theme includes:
- **Color Palette**: Primary, secondary, accent, background, and UI colors
- **Typography**: Custom font combinations for headlines and body text
- **Styling**: Theme-specific border radius and visual style
- **Icon**: Unique emoji icon representing the theme
- **Default Marquee**: Pre-configured welcome message
- **Category**: Organized by business type (beverage, food, dessert)

### Technical Details

#### Theme Structure
```typescript
interface ThemeConfig {
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
```

#### Color System
All colors use HSL values for easy manipulation:
- `background` - Main background color
- `foreground` - Primary text color
- `primary` - Main brand color
- `secondary` - Secondary brand color
- `accent` - Highlight/interactive color
- `muted` - Subtle background elements
- `destructive` - Error/danger color
- And more UI-specific colors

#### Font System
Each theme has three font variables:
- `--font-body` - Main content font
- `--font-headline` - Headers and titles
- `--font-accent` - Special accent text

### Adding New Themes

To add a new theme, edit `src/lib/themes.ts`:

```typescript
yourTheme: {
  id: 'your-theme',
  name: 'Your Theme Name',
  description: 'Theme description',
  category: 'beverage', // or 'food', 'dessert'
  colors: {
    background: 'H H% L%',
    foreground: 'H H% L%',
    // ... all color variables
  },
  fonts: {
    body: "'Font Name', sans-serif",
    headline: "'Font Name', serif",
    accent: "'Font Name', cursive",
  },
  borderRadius: '0.5rem',
  defaultMarqueeText: 'Welcome to {appName}!',
  icon: '🎯',
}
```

### Files Modified/Created

**Created:**
- `src/lib/themes.ts` - Theme definitions and utilities
- `src/context/ThemeContext.tsx` - Theme state management
- `src/components/theme-selector.tsx` - Theme selection UI

**Modified:**
- `src/app/layout.tsx` - Added ThemeProvider and Google Fonts
- `src/app/globals.css` - Added CSS variables for theming
- `src/context/AppContext.tsx` - Added theme ID to data structure
- `src/lib/types.ts` - Added themeId to DbData interface
- `src/components/logo.tsx` - Updated to use theme icons
- `src/components/main-layout.tsx` - Added theme font support
- `src/app/page.tsx` - Applied theme font classes
- `src/app/pengaturan/tampilan/page.tsx` - Replaced with theme selector

## Theme Categories

### Beverage Themes
- Coffee House
- Bubble Tea Shop
- Fresh & Healthy

### Food Themes
- Burger Joint
- Meatball House
- Artisan Bakery
- Pizza Paradise

### Dessert Themes
- Sweet Delights
- Ice Cream Parlor

### General
- Default (Petrichor)

## Customization Options

### Changing Theme Colors
Modify the HSL values in the theme definition. HSL format:
- Hue (0-360): Color type
- Saturation (0-100%): Color intensity
- Lightness (0-100%): Brightness

### Adding New Fonts
1. Add Google Font to `src/app/layout.tsx`
2. Reference it in theme definition
3. CSS variables will automatically apply it

### Theme Persistence
Themes are stored in:
- LocalStorage (`petrichor_theme`)
- AppContext database (`themeId` field)
- Survives page refreshes and app restarts

## Benefits

1. **Instant Visual Transformation** - One click changes entire app appearance
2. **Business-Specific Styling** - Themes tailored to different F&B types
3. **Consistent Design** - All components automatically adapt to theme
4. **Easy Customization** - Simple structure for adding/modifying themes
5. **Persistent Preferences** - Theme choice saved automatically
6. **Professional Typography** - Curated font combinations for each theme

## Testing the Theme System

To test the theme system:

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:9002`
3. Go to Settings → Tampilan
4. Try different themes and observe:
   - Color changes across all components
   - Font changes in headings and body text
   - Logo icon updates
   - Border radius changes
   - Chart colors in analytics
   - Overall visual transformation

## Future Enhancement Ideas

- Add dark mode variants for each theme
- Create custom theme builder UI
- Add theme preview screenshots
- Implement seasonal themes
- Add animated theme transitions
- Create theme sharing/export functionality
- Add gradient backgrounds options
- Implement texture/pattern overlays

---

**Enjoy your new custom theme system!** 🎨✨