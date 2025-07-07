"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { User, Database, Store } from "lucide-react"
import { MainLayout } from "@/components/main-layout"

const sidebarNavItems = [
  {
    title: "Profil & Tampilan",
    href: "/pengaturan/profil",
    icon: Store,
  },
  {
    title: "Akun",
    href: "/pengaturan/akun",
    icon: User,
  },
  {
    title: "Manajemen Data",
    href: "/pengaturan/data",
    icon: Database,
  },
]

interface PengaturanLayoutProps {
  children: React.ReactNode
}

export default function PengaturanLayout({ children }: PengaturanLayoutProps) {
  const pathname = usePathname()

  return (
    <MainLayout>
      <div className="flex min-h-[calc(100vh-10rem)] flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
           <h2 className="px-4 text-lg font-semibold tracking-tight mb-4">Pengaturan</h2>
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
        <div className="flex-1 lg:max-w-4xl">{children}</div>
      </div>
    </MainLayout>
  )
}
