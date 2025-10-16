import { createClient } from "@supabase/supabase-js"
import * as XLSX from "xlsx"
import JSZip from "jszip"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface Product {
  id?: string
  name?: string
  description?: string
  sku?: string
  category?: string
  vendor?: string
  price?: number
  stock?: number
  images?: string[]
  subgrupo?: string
  codigo_brk?: string
  ref_brk?: string
  posicion?: string
  ref_fmsi_oem?: string
  marca?: string
  linea?: string
  modelo?: string
  version?: string
  largo_mm?: number
  ancho_mm?: number
  espesor_mm?: number
  diametro_a_mm?: number
  alto_b_mm?: number
  espesor_c_mm?: number
  espesor_min_mm?: number
  agujeros?: string
  diametro_interno_a_mm?: number
  diametro_orificio_central_c_mm?: number
  altura_total_d_mm?: number
  agujeros4?: string
  diametro_interno_maximo?: number
  diametro?: number
  largo?: number
  x_juego_pastilla?: string
  largo_mm10?: number
  specifications?: any
  created_at?: string
  updated_at?: string
}

export interface BulkUploadResult {
  success: boolean
  message: string
  total: number
  success: number
  errors: number
  errorDetails?: string[]
}

// Check if Supabase is configured
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("products").select("count").limit(1)
    return !error
  } catch (error) {
    console.error("Supabase connection error:", error)
    return false
  }
}

// Parse Excel file
export async function parseExcelFile(file: File): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        // Skip header row
        const rows = jsonData.slice(1) as any[][]
        const products: Product[] = rows
          .filter((row) => row.length > 0 && row[0]) // Filter empty rows
          .map((row, index) => {
            const product: Product = {
              codigo_brk: row[0]?.toString().trim() || "",
              subgrupo: row[1]?.toString().trim() || "",
              marca: row[2]?.toString().trim() || "",
              linea: row[3]?.toString().trim() || "",
              modelo: row[4]?.toString().trim() || "",
              posicion: row[5]?.toString().trim() || "",
              ref_fmsi_oem: row[6]?.toString().trim() || "",
              version: row[7]?.toString().trim() || "",
              ancho_mm: row[8] ? Number(row[8]) : null,
              largo_mm: row[9] ? Number(row[9]) : null,
              espesor_mm: row[10] ? Number(row[10]) : null,
              diametro_a_mm: row[11] ? Number(row[11]) : null,
              diametro_interno_a_mm: row[12] ? Number(row[12]) : null,
              diametro_interno_maximo: row[13] ? Number(row[13]) : null,
              diametro_orificio_central_c_mm: row[14] ? Number(row[14]) : null,
              espesor_c_mm: row[15] ? Number(row[15]) : null,
              espesor_min_mm: row[16] ? Number(row[16]) : null,
              alto_b_mm: row[17] ? Number(row[17]) : null,
              altura_total_d_mm: row[18] ? Number(row[18]) : null,
              agujeros: row[19] ? Number(row[19]) : 0,
              x_juego_pastilla: row[20] ? Number(row[20]) : 0,
              price: row[21] ? Number(row[21]) : 0,
              stock: row[22] ? Number(row[22]) : 0,
            }

            // Generate name and description
            product.name = `${product.marca} ${product.linea} ${product.modelo} ${product.subgrupo}`.trim()
            product.description = `${product.subgrupo} ${product.posicion} para ${product.marca} ${product.linea} ${product.modelo} ${product.version}`.trim()
            product.sku = `${product.codigo_brk}${product.marca}${product.linea}${product.modelo}`.replace(/\s+/g, "").toUpperCase()
            product.category = product.subgrupo || "General"
            product.vendor = "BRK"
            product.images = [] // Initialize images array

          return product
        })

        resolve(products)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error("Error reading file"))
    reader.readAsArrayBuffer(file)
  })
}

// Parse ZIP file
export async function parseZipFile(file: File): Promise<Map<string, Blob>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
  const zip = new JSZip()
        const zipData = await zip.loadAsync(e.target?.result as ArrayBuffer)
  const imagesByFolder = new Map<string, Blob>()

        for (const [filename, file] of Object.entries(zipData.files)) {
          if (!file.dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
            const blob = await file.async("blob")
            // Extract codigo_brk from filename (e.g., "05P058.webp" -> "05P058")
            const codigoBrk = filename.split("/").pop()?.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "") || ""
            if (codigoBrk) {
              imagesByFolder.set(codigoBrk, blob)
            }
          }
        }

        resolve(imagesByFolder)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error("Error reading ZIP file"))
    reader.readAsArrayBuffer(file)
  })
}

// Upload image to Supabase Storage
async function uploadImageToStorage(folderName: string, imageBlob: Blob): Promise<string> {
  const fileName = `${folderName}/image_${Date.now()}.webp`
  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(fileName, imageBlob, {
      contentType: "image/webp",
      upsert: false,
    })

    if (error) {
    throw new Error(`Error uploading image: ${error.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName)

    return publicUrl
}

// Upload products to Supabase
export async function uploadProductsToSupabase(
  products: Product[],
  imagesByFolder: Map<string, Blob>,
  onProgress?: (progress: number) => void
): Promise<BulkUploadResult> {
  console.log(`[Bulk Upload] Starting upload of ${products.length} products`)
  console.log(`[Bulk Upload] Found ${imagesByFolder.size} images in ZIP file`)
  console.log(`[Bulk Upload] Image folders:`, Array.from(imagesByFolder.keys()))

  const result: BulkUploadResult = {
      success: true,
    message: "Upload completed",
    total: products.length,
    success: 0,
    errors: 0,
    errorDetails: [],
  }

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    
    try {
      // Upload images if available
      if (product.codigo_brk && imagesByFolder.has(product.codigo_brk)) {
        console.log(`[Bulk Upload] Uploading image for codigo_brk: ${product.codigo_brk}`)
        const imageBlob = imagesByFolder.get(product.codigo_brk)!
        const imageUrl = await uploadImageToStorage(product.codigo_brk, imageBlob)
              product.images = [imageUrl]
        console.log(`[Bulk Upload] Image uploaded successfully: ${imageUrl}`)
      } else {
        console.log(`[Bulk Upload] No image found for codigo_brk: ${product.codigo_brk}`)
      }

      // Upsert product into database (insert or update)
      console.log(`[Bulk Upload] Upserting product with images:`, product.images)
      const { error } = await supabase.from("products").upsert([product], {
        onConflict: 'codigo_brk,marca,linea,modelo,posicion,version'
      })
      
      if (error) {
        console.error(`[Bulk Upload] Database error for product ${product.codigo_brk}:`, error)
        throw new Error(error.message)
      }
      
      console.log(`[Bulk Upload] Product ${product.codigo_brk} upserted successfully`)

      result.success++
    } catch (error) {
      result.errors++
      result.errorDetails?.push(`Producto ${i + 1} (${product.codigo_brk}): ${error}`)
    }

    // Update progress
    const progress = Math.round(((i + 1) / products.length) * 100)
    onProgress?.(progress)
  }

  result.success = result.success === products.length
  result.message = `Procesados ${result.total} productos. ${result.success} exitosos (insertados/actualizados), ${result.errors} con errores.`

  return result
}

// Simple upload (Excel only)
export async function simpleUpload(
  file: File,
  onProgress?: (progress: number) => void
): Promise<BulkUploadResult> {
  const products = await parseExcelFile(file)
  return uploadProductsToSupabase(products, new Map(), onProgress)
}

// Get all products for dashboard stats
export async function getAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllProducts:", error)
    return []
  }
}

// Create sample template
export async function createSampleTemplate(): Promise<void> {
  const sampleData = [
    [
      "Código BRK",
      "Subgrupo",
      "Marca",
      "Línea",
      "Modelo",
      "Posición",
      "Ref FMSI/OEM",
      "Versión",
      "Ancho (mm)",
      "Largo (mm)",
      "Espesor (mm)",
      "Diámetro A (mm)",
      "Diámetro Interno A (mm)",
      "Diámetro Interno Máximo",
      "Diámetro Orificio Central C (mm)",
      "Espesor C (mm)",
      "Espesor Mín (mm)",
      "Alto B (mm)",
      "Altura Total D (mm)",
      "Agujeros",
      "X Juego Pastilla",
      "Precio",
      "Stock",
    ],
    [
      "11795",
      "PASTILLAS",
      "AUDI",
      "GOLF IV",
      "2019",
      "DELANTERO",
      "FMSI123",
      "V1",
      "43",
      "95.5",
      "16",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "0",
      "0",
      "50000",
      "10",
    ],
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(sampleData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Productos")

  XLSX.writeFile(workbook, "plantilla_productos_brk.xlsx")
}