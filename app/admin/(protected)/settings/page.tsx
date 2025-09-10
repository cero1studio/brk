import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Settings, Save } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Ajusta la configuración del sistema</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
            <CardDescription>Ajustes básicos del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="site-name">Nombre del Sitio</Label>
              <Input id="site-name" defaultValue="BRK Performance Brakes" placeholder="Nombre del sitio" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="site-description">Descripción</Label>
              <Input
                id="site-description"
                defaultValue="Pastillas de freno de alto rendimiento"
                placeholder="Descripción del sitio"
              />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Productos</CardTitle>
            <CardDescription>Ajustes relacionados con el catálogo de productos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="products-per-page">Productos por Página</Label>
              <Input
                id="products-per-page"
                type="number"
                defaultValue="12"
                placeholder="Número de productos por página"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="default-image">Imagen por Defecto</Label>
              <Input id="default-image" defaultValue="/placeholder.svg" placeholder="URL de imagen por defecto" />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Base de Datos</CardTitle>
            <CardDescription>Estado y configuración de la conexión a la base de datos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-muted-foreground">
              <Settings className="mx-auto h-8 w-8 mb-2" />
              <p>Configuración de base de datos</p>
              <p className="text-sm">Estado: Conectado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
