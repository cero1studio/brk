import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Package, Users, ShoppingCart, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema BRK Performance Brakes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+2 nuevas este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">+12% desde la semana pasada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">Tiempo de actividad</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Producto</Badge>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Nuevo producto agregado: Pastillas BRK-001</p>
                <p className="text-sm text-muted-foreground">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Carga</Badge>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Carga masiva completada: 150 productos</p>
                <p className="text-sm text-muted-foreground">Hace 5 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Sistema</Badge>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Backup automático completado</p>
                <p className="text-sm text-muted-foreground">Hace 1 día</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Monitoreo en tiempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Base de Datos</span>
              <Badge variant="default" className="bg-green-500">
                Activa
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API</span>
              <Badge variant="default" className="bg-green-500">
                Activa
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Almacenamiento</span>
              <Badge variant="default" className="bg-green-500">
                Normal
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Respaldo</span>
              <Badge variant="default" className="bg-green-500">
                Actualizado
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
