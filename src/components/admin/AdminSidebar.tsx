"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Package, Upload, Tags, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { href: "/admin/dashboard", label: "Panel de Control", icon: LayoutDashboard },
  { href: "/admin/products", label: "Gestionar Productos", icon: Package },
  { href: "/admin/bulk-upload", label: "Carga Masiva", icon: Upload },
  { href: "/admin/categories", label: "Gestionar Categorías", icon: Tags },
]

const settingsNavItems = [{ href: "/admin/settings", label: "Configuración", icon: Settings }]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout, isAuthenticated } = useAuth()
  const router = useRouter()

  console.log('🔍 AdminSidebar: isAuthenticated =', isAuthenticated)

  const handleLogout = () => {
    console.log('🚪 AdminSidebar: Logout clicked')
    logout()
  }

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-72 bg-card text-card-foreground p-5 flex flex-col shadow-lg border-r border-border">
      <nav className="flex-grow space-y-1.5">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={isActive(item.href) ? "secondary" : "ghost"}
            className="w-full justify-start text-base h-11 px-3 group transition-all duration-200"
            asChild
          >
            <Link href={item.href}>
              <item.icon
                className={`mr-3 h-5 w-5 ${isActive(item.href) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
              />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      <Separator className="my-4 bg-border" />
      <div className="space-y-1.5">
        {settingsNavItems.map((item) => (
          <Button
            key={item.href}
            variant={isActive(item.href) ? "secondary" : "ghost"}
            className="w-full justify-start text-base h-11 px-3 group transition-all duration-200"
            asChild
          >
            <Link href={item.href}>
              <item.icon
                className={`mr-3 h-5 w-5 ${isActive(item.href) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
              />
              {item.label}
            </Link>
          </Button>
        ))}
        {isAuthenticated && (
          <Button
            variant="ghost"
            className="w-full justify-center text-base h-11 px-3 text-red-500 hover:bg-gray-800/10 hover:text-gray-300 group"
            onClick={handleLogout}
            title="Cerrar Sesión"
          >
            <LogOut className="h-5 w-5 text-red-500 group-hover:text-gray-300" />
          </Button>
        )}
      </div>
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} BRK Performance Brakes</p>
      </div>
    </aside>
  )
}
