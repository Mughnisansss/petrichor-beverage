
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Database, Store, Heart } from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Palette } from "lucide-react";


const sidebarNavItems = [
  {
    title: "Profil Toko",
    href: "/pengaturan/profil",
    icon: Store,
  },
  {
    title: "Manajemen Data",
    href: "/pengaturan/data",
    icon: Database,
  },
   {
    title: "Donasi",
    href: "/pengaturan/donasi",
    icon: Heart,
  },
]

interface PengaturanLayoutProps {
  children: React.ReactNode
}

export default function PengaturanLayout({ children }: PengaturanLayoutProps) {
  const pathname = usePathname()

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pengaturan</h2>
          <p className="text-muted-foreground">
            Kelola profil, tampilan, dan data aplikasi.
          </p>
        </div>
        <Separator />
         <Alert>
            <Palette className="h-4 w-4" />
            <AlertTitle>Informasi Fitur</AlertTitle>
            <AlertDescription>
                Fitur kustomisasi tema sedang dalam perbaikan dan akan segera kembali dengan peningkatan. Terima kasih atas pengertian Anda.
            </AlertDescription>
        </Alert>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/5">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
              {sidebarNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      pathname === item.href
                        ? "bg-muted hover:bg-muted"
                        : "hover:bg-transparent hover:underline"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              ))}
            </nav>
          </aside>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </MainLayout>
  )
}
