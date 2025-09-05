import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, FolderPlus, Settings, Tag } from "lucide-react"
import { getAllProducts } from "@/lib/bulk-upload-supabase"

async function getDashboardStats() {
  try {
    const products = await getAllProducts()

    // Get unique categories
    const categories = new Set(products.map((p) => p.category).filter(Boolean))

    // Get unique brands/marcas
    const marcas = new Set(products.map((p) => p.marca).filter(Boolean))

    return {
      totalProducts: products.length,
      totalCategories: categories.size,
      totalMarcas: marcas.size,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalProducts: 0,
      totalCategories: 0,
      totalMarcas: 0,
    }
  }
}

export default async function AdminDashboardPage() {
  const { totalProducts, totalCategories, totalMarcas } = await getDashboardStats()

  const stats = [
    { title: "Productos Totales", value: totalProducts.toString(), icon: Package, color: "text-gray-300" },
    { title: "Categorías", value: totalCategories.toString(), icon: FolderPlus, color: "text-sky-400" },
    { title: "Marcas", value: totalMarcas.toString(), icon: Tag, color: "text-amber-400" },
  ]

  const quickActions = [
    { label: "Añadir Nuevo Producto", href: "/admin/products/new", icon: FolderPlus },
    { label: "Gestionar Productos", href: "/admin/products", icon: Package },
    { label: "Carga Masiva", href: "/admin/bulk-upload", icon: Package },
    { label: "Configuración del Sistema", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-white">Panel de Administración BRK</CardTitle>
          <CardDescription>
            ¡Bienvenido de nuevo! Aquí tienes un resumen de tu plataforma BRK Performance Brakes.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-gray-500/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">Datos actualizados</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Acciones Rápidas</CardTitle>
          <CardDescription>Accede rápidamente a las tareas administrativas comunes.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="justify-start p-6 text-left h-auto border-border hover:border-gray-600 group bg-transparent"
              asChild={!action.disabled}
              disabled={action.disabled}
            >
              {action.disabled ? (
                <div className="flex flex-col items-start">
                  <action.icon className="h-7 w-7 mb-2 text-muted-foreground group-hover:text-gray-300" />
                  <span className="font-semibold text-base text-muted-foreground">{action.label}</span>
                  <span className="text-xs text-muted-foreground/70">(Próximamente)</span>
                </div>
              ) : (
                <Link href={action.href} className="flex flex-col items-start">
                  <action.icon className="h-7 w-7 mb-2 text-muted-foreground group-hover:text-gray-300" />
                  <span className="font-semibold text-base group-hover:text-gray-300">{action.label}</span>
                </Link>
              )}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Actividad Reciente</CardTitle>
          <CardDescription>Resumen de productos y marcas en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="text-sm text-muted-foreground">Sistema conectado a base de datos Supabase.</li>
            <li className="text-sm text-muted-foreground">Carga masiva de productos disponible.</li>
            <li className="text-sm text-muted-foreground">Gestión de imágenes en Storage habilitada.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
