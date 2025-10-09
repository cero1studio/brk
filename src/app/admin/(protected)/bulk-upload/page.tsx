"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, FileSpreadsheet, Archive, Download, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  parseExcelFile,
  parseZipFile,
  uploadProductsToSupabase,
  simpleUpload,
  createSampleTemplate,
  type BulkUploadResult,
} from "@/lib/bulk-upload-supabase"

export default function BulkUploadPage() {
  const { toast } = useToast()

  // Upload states
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [simpleExcelFile, setSimpleExcelFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null)

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
      const result = await uploadProductsToSupabase(products, imagesByFolder, (progress) => {
        setUploadProgress(progress)
      })

      setUploadResult(result)
      toast({
        title: "Carga completada",
        description: `Se procesaron ${result.total} productos. ${result.success} exitosos, ${result.errors} con errores.`,
        variant: result.errors > 0 ? "destructive" : "default",
      })
    } catch (error) {
      console.error("Error during bulk upload:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error durante la carga masiva",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle simple upload
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
      const result = await simpleUpload(simpleExcelFile, (progress) => {
        setUploadProgress(progress)
      })

      setUploadResult(result)
      toast({
        title: "Carga completada",
        description: `Se procesaron ${result.total} productos. ${result.success} exitosos, ${result.errors} con errores.`,
        variant: result.errors > 0 ? "destructive" : "default",
      })
    } catch (error) {
      console.error("Error during simple upload:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error durante la carga",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Download sample template
  const handleDownloadTemplate = async () => {
    try {
      await createSampleTemplate()
      toast({
        title: "Plantilla descargada",
        description: "Se ha descargado la plantilla de ejemplo",
      })
    } catch (error) {
      console.error("Error downloading template:", error)
      toast({
        title: "Error",
        description: "No se pudo descargar la plantilla",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Carga Masiva de Productos</h1>
        <p className="text-muted-foreground">
          Sube múltiples productos usando archivos Excel y ZIP con imágenes
        </p>
      </div>

      <Tabs defaultValue="bulk" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bulk">Carga Completa (Excel + ZIP)</TabsTrigger>
          <TabsTrigger value="simple">Carga Simple (Solo Excel)</TabsTrigger>
        </TabsList>

        {/* Bulk Upload Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Excel File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Archivo Excel
                </CardTitle>
                <CardDescription>
                  Archivo Excel con los datos de los productos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded-md"
                  />
                  {excelFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      {excelFile.name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ZIP File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Archivo ZIP (Opcional)
                </CardTitle>
                <CardDescription>
                  Archivo ZIP con las imágenes de los productos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded-md"
                  />
                  {zipFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      {zipFile.name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Button
                  onClick={handleBulkUpload}
                  disabled={!excelFile || isUploading}
                  className="w-full"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-pulse" />
                      Subiendo... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Iniciar Carga Masiva
                    </>
                  )}
                </Button>

                {isUploading && (
                  <Progress value={uploadProgress} className="w-full" />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simple Upload Tab */}
        <TabsContent value="simple" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Carga Simple
              </CardTitle>
              <CardDescription>
                Sube solo un archivo Excel con los datos básicos de los productos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setSimpleExcelFile(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded-md"
              />
              {simpleExcelFile && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {simpleExcelFile.name}
                </div>
              )}
              <Button
                onClick={handleSimpleUpload}
                disabled={!simpleExcelFile || isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                    Subiendo... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Iniciar Carga Simple
                  </>
                )}
              </Button>
              {isUploading && (
                <Progress value={uploadProgress} className="w-full" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Plantilla de Ejemplo
          </CardTitle>
          <CardDescription>
            Descarga una plantilla Excel con el formato correcto para la carga masiva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDownloadTemplate} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descargar Plantilla
          </Button>
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.errors > 0 ? (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              Resultado de la Carga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{uploadResult.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{uploadResult.success}</div>
                <div className="text-sm text-muted-foreground">Exitosos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{uploadResult.errors}</div>
                <div className="text-sm text-muted-foreground">Con Errores</div>
              </div>
            </div>

            {uploadResult.errorDetails && uploadResult.errorDetails.length > 0 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Errores encontrados:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {uploadResult.errorDetails.slice(0, 5).map((error, index) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                    {uploadResult.errorDetails.length > 5 && (
                      <p className="text-sm text-muted-foreground">
                        ... y {uploadResult.errorDetails.length - 5} errores más
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}