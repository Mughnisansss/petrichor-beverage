
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SessionProvider } from '@/components/session-provider';

export const metadata: Metadata = {
  title: 'Petrichor',
  description: 'Aplikasi pelacak penjualan dan laba untuk bisnis minuman.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Pacifico&family=Playfair+Display:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&family=Bangers&family=Dancing+Script:wght@400;500;600;700&family=Merriweather:wght@400;500;600;700&family=Permanent+Marker&family=Fredoka+One&family=Lora:wght@400;500;600;700&family=Great+Vibes&family=Poppins:wght@400;500;600;700&family=Sacramento&family=Abril+Fatface&family=Great+Vibes&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SessionProvider>
          <AppProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AppProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
