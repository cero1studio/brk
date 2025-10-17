"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../src/components/ui/tabs"
import { Button } from "../../../../src/components/ui/button"
import { Progress } from "../../../../src/components/ui/progress"
import { Alert, AlertDescription } from "../../../../src/components/ui/alert"
import { Badge } from "../../../../src/components/ui/badge"
import { Upload, FileSpreadsheet, Archive, Download, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "../../../../src/hooks/use-toast"
import {
  parseExcelFile,
  parseZipFile,
  uploadProductsToSupabase,
  simpleUpload,
  createSampleTemplate,
  type BulkUploadResult,
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
  const [uploadLogs, setUploadLogs] = useState<string[]>([])

  // Function to add logs to the interface
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    setUploadLogs(prev => [...prev, logMessage])
    console.log(logMessage) // Also log to console
  }

  // Handle bulk upload (Excel + ZIP)
  const handleBulkUpload = async () => {
    setUploadLogs([]) // Clear previous logs
    addLog(`🚀 ===== INICIANDO CARGA MASIVA =====`)
    addLog(`📁 Archivo Excel: ${excelFile?.name || 'No seleccionado'}`)
    addLog(`📦 Archivo ZIP: ${zipFile?.name || 'No seleccionado'}`)
    
    if (!excelFile) {
      addLog(`❌ No se seleccionó archivo Excel`)
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo Excel",
        variant: "destructive",
      })
      return
    }

    addLog(`✅ Iniciando proceso de carga...`)
    setIsUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    try {
      // Parse Excel file
      addLog(`📊 Paso 1: Procesando archivo Excel...`)
      const products = await parseExcelFile(excelFile)
      addLog(`✅ Procesados ${products.length} productos del archivo Excel`)
      addLog(`📋 Códigos BRK encontrados: ${products.map(p => p.codigo_brk).slice(0, 10).join(', ')}`)

      // Parse ZIP file if provided
      let imagesByFolder = new Map<string, Blob>()
      if (zipFile) {
        addLog(`📦 Paso 2: Procesando archivo ZIP: ${zipFile.name}`)
        imagesByFolder = await parseZipFile(zipFile)
        addLog(`✅ Encontradas ${imagesByFolder.size} imágenes en el archivo ZIP`)
        addLog(`📋 Referencias de imágenes: ${Array.from(imagesByFolder.keys()).slice(0, 10).join(', ')}`)
      } else {
        addLog(`⚠️ No se proporcionó archivo ZIP`)
      }

      // Upload products with ALL fields to database
      addLog(`🚀 Paso 3: Iniciando carga a base de datos...`)
      const result = await uploadProductsToSupabase(products, imagesByFolder, setUploadProgress, addLog)

      setUploadResult(result)
      addLog(`✅ Carga completada!`)
      addLog(`📊 Resultado: ${result.success ? 'Éxito total' : 'Éxito parcial'}`)
      addLog(`📈 Productos procesados: ${result.total}`)
      addLog(`✅ Exitosos: ${result.success}`)
      addLog(`❌ Errores: ${result.errors}`)

      if (result.success) {
        addLog(`🎉 ¡ÉXITO! Todos los productos cargados correctamente`)
        toast({
          title: "¡Éxito!",
          description: result.message,
        })
      } else {
        addLog(`⚠️ ÉXITO PARCIAL - Algunos errores ocurrieron`)
        toast({
          title: "Carga parcial",
          description: result.message,
          variant: "destructive",
        })
      }

    } catch (error) {
      addLog(`❌ ERROR: ${(error as Error).message}`)
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      addLog(`🏁 Proceso finalizado`)
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
      const result = await simpleUpload(simpleExcelFile, setUploadProgress)
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

  const downloadTemplate = async () => {
    try {
      await createSampleTemplate()
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bulk">Carga con Archivos</TabsTrigger>
          <TabsTrigger value="simple">Carga Simple</TabsTrigger>
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
                raíz. Las imágenes deben tener el nombre del REF BRK + .webp
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
                        Debe contener TODOS los campos: SUBGRUPO, CÓDIGOBRK, REF BRK (requeridos) + todos los demás campos
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
                      <strong>Excel:</strong> Debe contener SUBGRUPO, CÓDIGOBRK y REF BRK (obligatorios)
                    </li>
                    <li>
                      <strong>ZIP:</strong> Todas las imágenes en la carpeta raíz (sin subcarpetas)
                    </li>
                    <li>
                      <strong>Imágenes:</strong> Nombre del archivo debe ser REF BRK.webp
                    </li>
                    <li>
                      <strong>Ejemplo:</strong> REF001.webp, REF002.webp, REF003.webp
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

              {/* Upload Logs */}
              {uploadLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Logs en tiempo real</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setUploadLogs([])}
                    >
                      Limpiar
                    </Button>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-80 overflow-y-auto font-mono text-xs">
                    {uploadLogs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))}
                  </div>
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
                        <span>Total: {uploadResult.total}</span>
                        <span className="text-green-600">Exitosos: {uploadResult.success}</span>
                        <span className="text-red-600">Fallidos: {uploadResult.errors}</span>
                      </div>
                      {uploadResult.errorDetails && uploadResult.errorDetails.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium">Ver errores</summary>
                          <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                            {uploadResult.errorDetails.map((error: string, index: number) => (
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

              {/* Upload Logs */}
              {uploadLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Logs en tiempo real</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setUploadLogs([])}
                    >
                      Limpiar
                    </Button>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-80 overflow-y-auto font-mono text-xs">
                    {uploadLogs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))}
                  </div>
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
                        <span>Total: {uploadResult.total}</span>
                        <span className="text-green-600">Exitosos: {uploadResult.success}</span>
                        <span className="text-red-600">Fallidos: {uploadResult.errors}</span>
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

      </Tabs>
    </div>
  )
}
