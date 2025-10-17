"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, FolderPlus, Settings, Tag, RefreshCw } from "lucide-react"
import { getAllProducts } from "@/lib/bulk-upload-supabase"
import { useState, useEffect } from "react"

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalMarcas: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalMarcas: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboardStats = async () => {
    try {
      console.log("🔍 Obteniendo estadísticas del dashboard...")
      setIsLoading(true)
      const products = await getAllProducts()
      console.log(`📊 Productos individuales obtenidos: ${products.length}`)
      console.log("📊 Primeros 3 productos:", products.slice(0, 3))

      // Get unique categories (usando subgrupo que es más específico)
      const categories = new Set(products.map((p) => p.subgrupo).filter(Boolean))
      console.log(`📁 Subgrupos únicos: ${categories.size}`)
      console.log("📁 Subgrupos encontrados:", Array.from(categories))

      // Get unique brands/marcas
      const marcas = new Set(products.map((p) => p.marca).filter(Boolean))
      console.log(`🏷️ Marcas únicas: ${marcas.size}`)
      console.log("🏷️ Marcas encontradas:", Array.from(marcas))

      const newStats = {
        totalProducts: products.length, // Total de productos individuales (no agrupados)
        totalCategories: categories.size,
        totalMarcas: marcas.size,
      }

      console.log("✅ Estadísticas calculadas (productos individuales):", newStats)
      setStats(newStats)
    } catch (error) {
      console.error("❌ Error fetching dashboard stats:", error)
      setStats({
        totalProducts: 0,
        totalCategories: 0,
        totalMarcas: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  // Actualizar estadísticas cuando la página se vuelve visible (usuario regresa de otra página)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Dashboard: Página visible, actualizando estadísticas...')
        fetchDashboardStats()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const statsCards = [
    { title: "Productos Individuales", value: stats.totalProducts.toString(), icon: Package, color: "text-gray-300" },
    { title: "Subgrupos", value: stats.totalCategories.toString(), icon: FolderPlus, color: "text-sky-400" },
    { title: "Marcas", value: stats.totalMarcas.toString(), icon: Tag, color: "text-amber-400" },
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
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-headline text-white">Panel de Administración BRK</CardTitle>
              <CardDescription>
                ¡Bienvenido de nuevo! Aquí tienes un resumen de tu plataforma BRK Performance Brakes.
              </CardDescription>
            </div>
            <Button
              onClick={fetchDashboardStats}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-gray-500/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {isLoading ? '...' : stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading ? 'Actualizando...' : 'Datos en tiempo real'}
              </p>
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
