import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Upload, FileSpreadsheet, Archive } from "lucide-react"

export default function BulkUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Carga Masiva</h1>
        <p className="text-muted-foreground">Sube múltiples productos usando archivos Excel o CSV</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Subir Excel/CSV
            </CardTitle>
            <CardDescription>Carga productos desde un archivo Excel o CSV</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Arrastra tu archivo aquí o haz clic para seleccionar</p>
              <Button variant="outline">Seleccionar Archivo</Button>
            </div>
            <p className="text-xs text-muted-foreground">Formatos soportados: .xlsx, .xls, .csv</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Subir con Imágenes
            </CardTitle>
            <CardDescription>Carga productos con sus imágenes usando un archivo ZIP</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Archive className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Sube un ZIP con Excel + imágenes</p>
              <Button variant="outline">Seleccionar ZIP</Button>
            </div>
            <p className="text-xs text-muted-foreground">El ZIP debe contener un Excel y una carpeta "images"</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Cargas</CardTitle>
          <CardDescription>Últimas cargas masivas realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="mx-auto h-12 w-12 mb-4" />
            <p>No hay cargas recientes</p>
            <p className="text-sm">El historial de cargas aparecerá aquí</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
