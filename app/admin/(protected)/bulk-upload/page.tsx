"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../src/components/ui/tabs"
import { Button } from "../../../../src/components/ui/button"
import { Progress } from "../../../../src/components/ui/progress"
import { Alert, AlertDescription } from "../../../../src/components/ui/alert"
import { Badge } from "../../../../src/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../src/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../src/components/ui/table"
import { Upload, FileSpreadsheet, Archive, Download, AlertCircle, CheckCircle, Eye, RotateCcw } from "lucide-react"
import { useToast } from "../../../../src/hooks/use-toast"
import {
  parseExcelFile,
  parseZipFile,
  uploadProductsToSupabase,
  simpleUpload,
  getUploadHistory,
  rollbackUpload,
  createSampleTemplate,
  type BulkUploadResult,
  type UploadHistory,
} from "../../../../src/lib/bulk-upload-supabase"

export default function BulkUploadPage() {
  const { toast } = useToast()

  // Upload states
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [simpleExcelFile, setSimpleExcelFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null)

  // History states
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [selectedUpload, setSelectedUpload] = useState<UploadHistory | null>(null)

  // Load upload history
  const loadUploadHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    try {
      const history = await getUploadHistory()
      setUploadHistory(history)
      console.log(`Loaded ${history.length} upload history records`)
    } catch (error) {
      console.error("Failed to load upload history:", error)
      toast({
        title: "Información",
        description: "Usando historial en memoria (las tablas de base de datos no están disponibles)",
      })
      // Still try to get cached history
      setUploadHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }, [toast])

  // Handle bulk upload (Excel + ZIP)
  const handleBulkUpload = async () => {
    if (!excelFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo Excel",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    try {
      // Parse Excel file
      const products = await parseExcelFile(excelFile)
      console.log(`Parsed ${products.length} products from Excel file`)

      // Parse ZIP file if provided
      let imagesByFolder = new Map<string, Blob>()
      if (zipFile) {
        imagesByFolder = await parseZipFile(zipFile)
        console.log(`Found ${imagesByFolder.size} images in ZIP file`)
      }

      // Upload products with ALL fields to database
      const result = await uploadProductsToSupabase(products, imagesByFolder, setUploadProgress)

      setUploadResult(result)

      if (result.success) {
        toast({
          title: "¡Éxito!",
          description: result.message,
        })
      } else {
        toast({
          title: "Carga parcial",
          description: result.message,
          variant: "destructive",
        })
      }

      // Reload history
      await loadUploadHistory()
    } catch (error) {
      console.error("Bulk upload error:", error)
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle simple upload (Excel only)
  const handleSimpleUpload = async () => {
    if (!simpleExcelFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo Excel",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    try {
      console.log("Starting simple upload process...")
      const products = await parseExcelFile(simpleExcelFile)
      console.log(`Parsed ${products.length} products from file`)

      // Upload products with ALL fields to database (no images)
      const result = await simpleUpload(products, setUploadProgress)
      console.log("Simple upload completed:", result)

      setUploadResult(result)

      if (result.success) {
        toast({
          title: "¡Éxito!",
          description: result.message,
        })
      } else {
        toast({
          title: "Carga parcial",
          description: result.message,
          variant: "destructive",
        })
      }

      await loadUploadHistory()
    } catch (error) {
      console.error("Simple upload error:", error)
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle rollback
  const handleRollback = async (uploadId: string) => {
    try {
      await rollbackUpload(uploadId)
      toast({
        title: "¡Éxito!",
        description: "Carga revertida exitosamente",
      })
      await loadUploadHistory()
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al revertir la carga",
        variant: "destructive",
      })
    }
  }

  const downloadTemplate = async () => {
    try {
      const XLSX = await import("xlsx")
      const template = createSampleTemplate()

      // Convert to Excel format using XLSX
      const worksheet = XLSX.utils.json_to_sheet(template)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Productos")

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "plantilla_productos_brk_completa.xlsx"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Plantilla descargada",
        description: "La plantilla Excel completa con todos los campos se ha descargado exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al generar la plantilla Excel",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Carga Masiva de Productos</h1>
          <p className="text-muted-foreground">
            Sube productos desde archivos Excel (.xlsx) con imágenes organizadas por subgrupo
          </p>
        </div>
        <Button onClick={downloadTemplate} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Descargar Plantilla Excel
        </Button>
      </div>

      <Tabs defaultValue="bulk" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bulk">Carga con Archivos</TabsTrigger>
          <TabsTrigger value="simple">Carga Simple</TabsTrigger>
          <TabsTrigger value="history" onClick={loadUploadHistory}>
            Historial
          </TabsTrigger>
        </TabsList>

        {/* Bulk Upload Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Carga Masiva con Imágenes
              </CardTitle>
              <CardDescription>
                Sube un archivo Excel (.xlsx) con los datos de productos y un ZIP con todas las imágenes en la carpeta
                raíz. Las imágenes deben tener el nombre del CÓDIGOBRK + .webp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Excel File Upload */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Archivo Excel</p>
                      <p className="text-xs text-muted-foreground">
                        Debe contener TODOS los campos: SUBGRUPO, CÓDIGOBRK (requeridos) + todos los demás campos
                      </p>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="excel-upload"
                      />
                      <label htmlFor="excel-upload">
                        <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                          <span>Seleccionar Archivo</span>
                        </Button>
                      </label>
                      {excelFile && <p className="text-sm text-green-600 mt-2">✓ {excelFile.name}</p>}
                    </div>
                  </div>
                </div>

                {/* ZIP File Upload */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Archive className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Archivo ZIP (.zip)</p>
                      <p className="text-xs text-muted-foreground">
                        Carpetas con nombre del SUBGRUPO, imágenes: CÓDIGOBRK.webp
                      </p>
                      <input
                        type="file"
                        accept=".zip"
                        onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="zip-upload"
                      />
                      <label htmlFor="zip-upload">
                        <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                          <span>Seleccionar ZIP</span>
                        </Button>
                      </label>
                      {zipFile && <p className="text-sm text-green-600 mt-2">✓ {zipFile.name}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Estructura requerida:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>
                      <strong>Excel:</strong> Debe contener SUBGRUPO y CÓDIGOBRK (obligatorios)
                    </li>
                    <li>
                      <strong>ZIP:</strong> Todas las imágenes en la carpeta raíz (sin subcarpetas)
                    </li>
                    <li>
                      <strong>Imágenes:</strong> Nombre del archivo debe ser CÓDIGOBRK.webp
                    </li>
                    <li>
                      <strong>Ejemplo:</strong> BRK001.webp, BRK002.webp, 32662.webp
                    </li>
                    <li>
                      <strong>Nota:</strong> Si hay imágenes duplicadas, se sobrescribirán automáticamente
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso de carga</span>
                    <span>{uploadProgress.toFixed(2)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Upload Result */}
              {uploadResult && (
                <Alert className={uploadResult.success ? "border-green-500" : "border-yellow-500"}>
                  {uploadResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>{uploadResult.message}</p>
                      <div className="flex gap-4 text-sm">
                        <span>Total: {uploadResult.totalProducts}</span>
                        <span className="text-green-600">Exitosos: {uploadResult.successfulProducts}</span>
                        <span className="text-red-600">Fallidos: {uploadResult.failedProducts}</span>
                      </div>
                      {uploadResult.errors.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium">Ver errores</summary>
                          <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                            {uploadResult.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Upload Button */}
              <Button onClick={handleBulkUpload} disabled={!excelFile || isUploading} className="w-full" size="lg">
                {isUploading ? "Subiendo..." : "Iniciar Carga Masiva"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simple Upload Tab */}
        <TabsContent value="simple" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Carga Simple (Solo Archivo)
              </CardTitle>
              <CardDescription>Sube productos desde un archivo Excel (.xlsx) sin imágenes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-medium">Archivo Excel (.xlsx)</p>
                    <p className="text-sm text-muted-foreground">
                      Debe contener SUBGRUPO y CÓDIGOBRK como campos obligatorios
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setSimpleExcelFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="simple-excel-upload"
                  />
                  <label htmlFor="simple-excel-upload">
                    <Button variant="outline" size="lg" className="cursor-pointer bg-transparent" asChild>
                      <span>Seleccionar Archivo</span>
                    </Button>
                  </label>
                  {simpleExcelFile && <p className="text-sm text-green-600">✓ {simpleExcelFile.name}</p>}
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso de carga</span>
                    <span>{uploadProgress.toFixed(2)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Upload Result */}
              {uploadResult && (
                <Alert className={uploadResult.success ? "border-green-500" : "border-yellow-500"}>
                  {uploadResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>{uploadResult.message}</p>
                      <div className="flex gap-4 text-sm">
                        <span>Total: {uploadResult.totalProducts}</span>
                        <span className="text-green-600">Exitosos: {uploadResult.successfulProducts}</span>
                        <span className="text-red-600">Fallidos: {uploadResult.failedProducts}</span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSimpleUpload}
                disabled={!simpleExcelFile || isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? "Subiendo..." : "Iniciar Carga Simple"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cargas</CardTitle>
              <CardDescription>Revisa el historial de cargas masivas y gestiona rollbacks</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <p>Cargando historial...</p>
                </div>
              ) : uploadHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay cargas registradas</p>
                  <p className="text-sm mt-2">Realiza tu primera carga masiva para ver el historial aquí</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Productos</TableHead>
                      <TableHead>Exitosos</TableHead>
                      <TableHead>Fallidos</TableHead>
                      <TableHead>Imágenes</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadHistory.map((upload) => (
                      <TableRow key={upload.id}>
                        <TableCell>{new Date(upload.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              upload.status === "completed"
                                ? "default"
                                : upload.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {upload.status === "completed"
                              ? "Completado"
                              : upload.status === "failed"
                                ? "Fallido"
                                : upload.status === "rolled_back"
                                  ? "Revertido"
                                  : "Parcial"}
                          </Badge>
                        </TableCell>
                        <TableCell>{upload.total_products}</TableCell>
                        <TableCell className="text-green-600">{upload.successful_products}</TableCell>
                        <TableCell className="text-red-600">{upload.failed_products}</TableCell>
                        <TableCell>
                          {upload.has_images ? (
                            <Badge variant="outline">Con imágenes</Badge>
                          ) : (
                            <Badge variant="secondary">Sin imágenes</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedUpload(upload)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Detalles de Carga</DialogTitle>
                                  <DialogDescription>Información detallada de la carga masiva</DialogDescription>
                                </DialogHeader>
                                {selectedUpload && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium">ID de Carga</p>
                                        <p className="text-sm text-muted-foreground">{selectedUpload.upload_id}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Fecha</p>
                                        <p className="text-sm text-muted-foreground">
                                          {new Date(selectedUpload.created_at).toLocaleString()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Total de Productos</p>
                                        <p className="text-sm text-muted-foreground">{selectedUpload.total_products}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Estado</p>
                                        <Badge
                                          variant={
                                            selectedUpload.status === "completed"
                                              ? "default"
                                              : selectedUpload.status === "failed"
                                                ? "destructive"
                                                : "secondary"
                                          }
                                        >
                                          {selectedUpload.status === "completed"
                                            ? "Completado"
                                            : selectedUpload.status === "failed"
                                              ? "Fallido"
                                              : selectedUpload.status === "rolled_back"
                                                ? "Revertido"
                                                : "Parcial"}
                                        </Badge>
                                      </div>
                                    </div>
                                    {selectedUpload.errors.length > 0 && (
                                      <div>
                                        <p className="text-sm font-medium mb-2">Errores:</p>
                                        <div className="max-h-40 overflow-y-auto">
                                          <ul className="list-disc list-inside text-xs space-y-1">
                                            {selectedUpload.errors.map((error, index) => (
                                              <li key={index}>{error}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            {upload.successful_products > 0 && upload.status !== "rolled_back" && (
                              <Button variant="outline" size="sm" onClick={() => handleRollback(upload.upload_id)}>
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
