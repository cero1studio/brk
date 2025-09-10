import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Plus, Search, Filter } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Package } from "lucide-react" // Import the Package component

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Productos</h1>
          <p className="text-muted-foreground">Administra el catálogo de productos BRK Performance Brakes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
          <CardDescription>Encuentra productos específicos usando los filtros</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Buscar por código, nombre, marca..." className="w-full" />
            </div>
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>Productos disponibles en el catálogo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="mx-auto h-12 w-12 mb-4" />
            <p>Los productos se cargarán aquí</p>
            <p className="text-sm">Usa la carga masiva o agrega productos individualmente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
