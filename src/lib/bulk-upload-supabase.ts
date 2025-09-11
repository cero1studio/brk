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
  totalProducts: number
  successfulProducts: number
  failedProducts: number
  errors: string[]
}

export interface UploadHistory {
  id: string
  upload_id: string
  filename: string
  total_products: number
  successful_products: number
  failed_products: number
  created_at: string
  status: "completed" | "failed" | "partial" | "rolled_back"
  has_images: boolean
  errors: string[]
}

// Memory storage fallback
let memoryProducts: Product[] = []
const memoryUploadHistory: UploadHistory[] = []

// Check if Supabase is configured and initialize Firebase
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from("products").select("count").limit(1)
    return !error
  } catch {
    return false
  }
}

// Parse Excel/CSV file
export async function parseExcelFile(file: File): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, {
          type: "array",
          codepage: 65001, // UTF-8 codepage
          cellText: false,
          cellDates: true,
        })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: "",
          blankrows: false,
        })

        const normalizeHeader = (header: string): string => {
          return header
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/\s+/g, "") // Remove spaces
            .toUpperCase()
        }

        const createHeaderMap = (headers: string[]) => {
          const headerMap = new Map<string, string>()

          headers.forEach((header) => {
            const normalized = normalizeHeader(header)

            // Map common variations to standard field names
            if (normalized.includes("CODIGO") && normalized.includes("BRK")) {
              headerMap.set("codigo_brk", header)
            } else if (normalized === "REFBRK" || (normalized.includes("REF") && normalized.includes("BRK"))) {
              headerMap.set("ref_brk", header)
            } else if (normalized === "SUBGRUPO") {
              headerMap.set("subgrupo", header)
            } else if (normalized === "POSICION") {
              headerMap.set("posicion", header)
            } else if (normalized.includes("FMSI") || normalized.includes("OEM")) {
              headerMap.set("ref_fmsi_oem", header)
            } else if (normalized === "MARCA") {
              headerMap.set("marca", header)
            } else if (normalized === "LINEA") {
              headerMap.set("linea", header)
            } else if (normalized === "MODELO") {
              headerMap.set("modelo", header)
            } else if (normalized === "VERSION") {
              headerMap.set("version", header)
            } else if (normalized === "PRECIO") {
              headerMap.set("precio", header)
            } else if (normalized === "STOCK") {
              headerMap.set("stock", header)
            }
            // Add dimensional mappings
            else if (normalized.includes("LARGO") && normalized.includes("MM") && !normalized.includes("10")) {
              headerMap.set("largo_mm", header)
            } else if (normalized.includes("ANCHO") && normalized.includes("MM")) {
              headerMap.set("ancho_mm", header)
            } else if (
              normalized.includes("ESPESOR") &&
              normalized.includes("MM") &&
              !normalized.includes("MIN") &&
              !normalized.includes("C")
            ) {
              headerMap.set("espesor_mm", header)
            }
          })

          return headerMap
        }

        if (jsonData.length === 0) {
          throw new Error("El archivo Excel está vacío")
        }

        const headers = Object.keys(jsonData[0])
        const headerMap = createHeaderMap(headers)

        console.log("[v0] Header mapping created:", Object.fromEntries(headerMap))

        const products: Product[] = jsonData.map((row: any, index: number) => {
          const getValue = (field: string): string => {
            const header = headerMap.get(field)
            return header ? String(row[header] || "") : ""
          }

          // Extract main fields using robust mapping
          const subgrupo = getValue("subgrupo")
          const codigo_brk = getValue("codigo_brk") || getValue("ref_brk") // Fallback to ref_brk
          const ref_brk = getValue("ref_brk")
          const posicion = getValue("posicion")
          const ref_fmsi_oem = getValue("ref_fmsi_oem")
          const marca = getValue("marca")
          const linea = getValue("linea")
          const modelo = getValue("modelo")
          const version = getValue("version")

          if (!codigo_brk || codigo_brk.trim() === "") {
            throw new Error(
              `Fila ${index + 1}: No se encontró CÓDIGOBRK o REF BRK válido. Headers disponibles: ${headers.join(", ")}`,
            )
          }

          // Generate SKU: codigo_brk + marca + linea + modelo
          const sku = `${codigo_brk}${marca}${linea}${modelo}`.replace(/\s+/g, "").toUpperCase()

          // Generate name from available data
          const name = `${marca} ${linea} ${modelo} ${subgrupo}`.trim() || "Producto sin nombre"

          // Generate description
          const description = `${subgrupo} ${posicion} para ${marca} ${linea} ${modelo} ${version}`.trim()

          const product = {
            name,
            description,
            sku,
            category: subgrupo,
            vendor: "BRK",
            price: Number.parseFloat(getValue("precio") || "0") || 0,
            stock: Number.parseInt(getValue("stock") || "0") || 0,
            images: [],
            subgrupo,
            codigo_brk,
            ref_brk,
            posicion,
            ref_fmsi_oem,
            marca,
            linea,
            modelo,
            version,
            largo_mm: Number.parseFloat(getValue("largo_mm") || "0") || null,
            ancho_mm: Number.parseFloat(getValue("ancho_mm") || "0") || null,
            espesor_mm: Number.parseFloat(getValue("espesor_mm") || "0") || null,
            diametro_a_mm: Number.parseFloat(row["DIÁMETRO (A) mm"] || "0") || null,
            alto_b_mm: Number.parseFloat(row["ALTO (B) mm"] || "0") || null,
            espesor_c_mm: Number.parseFloat(row["ESPESOR (C) mm"] || "0") || null,
            espesor_min_mm: Number.parseFloat(row["ESPESOR MIN, mm"] || "0") || null,
            agujeros: String(row["AGUJEROS"] || ""),
            diametro_interno_a_mm: Number.parseFloat(row["DIÁMETRO INTERNO (A) mm"] || "0") || null,
            diametro_orificio_central_c_mm: Number.parseFloat(row["DIAMETRO ORIFICIO CENTRAL (C) mm"] || "0") || null,
            altura_total_d_mm: Number.parseFloat(row["ALTURA TOTAL (D) mm"] || "0") || null,
            agujeros4: String(row["AGUJEROS4"] || ""),
            diametro_interno_maximo: Number.parseFloat(row["DIÁMETRO INTERNO MÁXIMO"] || "0") || null,
            diametro: Number.parseFloat(row["DIÁMETRO"] || "0") || null,
            largo: Number.parseFloat(row["LARGO"] || "0") || null,
            x_juego_pastilla: String(row["X JUEGO PASTILLA"] || ""),
            largo_mm10: Number.parseFloat(row["LARGO (mm)10"] || "0") || null,
            specifications: {},
          }

          return product
        })

        resolve(products)
      } catch (error) {
        console.error("Error parsing Excel:", error)
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error("Error reading file"))
    reader.readAsArrayBuffer(file)
  })
}

// Parse ZIP file with images
export async function parseZipFile(file: File): Promise<Map<string, Blob>> {
  const zip = new JSZip()
  const zipContent = await zip.loadAsync(file)
  const imagesByFolder = new Map<string, Blob>()

  console.log("ZIP file contents:", Object.keys(zipContent.files)) // Debug log

  // Extract images from ZIP
  for (const [filename, fileData] of Object.entries(zipContent.files)) {
    // Skip directories and system files
    if (fileData.dir || filename.startsWith("__MACOSX/") || filename.startsWith(".")) {
      console.log(`Skipping directory/system file: ${filename}`)
      continue
    }

    // Check if it's an image file
    if (filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      try {
        const arrayBuffer = await fileData.async("arraybuffer")
        const blob = new Blob([arrayBuffer])
        // Use just the filename without path
        const cleanFilename = filename.split("/").pop() || filename
        imagesByFolder.set(cleanFilename, blob)
        console.log(`Extracted image: ${cleanFilename}`) // Debug log
      } catch (error) {
        console.error(`Error processing image ${filename}:`, error)
      }
    }
  }

  console.log(`Total images extracted: ${imagesByFolder.size}`) // Debug log
  console.log("Image filenames:", Array.from(imagesByFolder.keys())) // Debug log
  return imagesByFolder
}

// Upload image to Supabase Storage
async function uploadImage(file: Blob, productCode: string, originalFilename: string): Promise<string | null> {
  try {
    console.log(`Attempting to upload image for product: ${productCode}`)

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    const fileName = originalFilename
    const filePath = fileName

    console.log(`Uploading to Supabase Storage bucket "products" with path: ${filePath}`)

    const { data, error } = await supabase.storage.from("products").upload(filePath, uint8Array, {
      contentType: file.type || "image/webp",
      upsert: true,
    })

    if (error) {
      console.error(`Supabase storage error for ${productCode}:`, error)
      throw error
    }

    console.log(`Upload successful for ${productCode}:`, data)

    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(filePath)

    console.log(`Generated public URL for ${productCode}: ${publicUrl}`)
    return publicUrl
  } catch (error) {
    console.error(`Error uploading image for ${productCode}:`, error)
    return null
  }
}

// Upload products to Supabase
export async function uploadProductsToSupabase(
  products: Product[],
  images?: Map<string, Blob>,
  onProgress?: (progress: number) => void,
): Promise<BulkUploadResult> {
  const isSupabaseConnected = await checkSupabaseConnection()

  if (!isSupabaseConnected) {
    // Fallback to memory storage
    memoryProducts = [...memoryProducts, ...products]
    return {
      success: true,
      message: `${products.length} productos guardados en memoria (Supabase no disponible)`,
      totalProducts: products.length,
      successfulProducts: products.length,
      failedProducts: 0,
      errors: [],
    }
  }

  let success = 0
  let failed = 0
  const errors: string[] = []

  console.log(`Starting upload of ${products.length} products`) // Debug log
  if (images) {
    console.log(`Available images: ${images.size}`) // Debug log
    console.log("Image keys:", Array.from(images.keys())) // Debug log
  }

  for (let i = 0; i < products.length; i++) {
    try {
      const product = products[i]
      console.log(`Processing product ${i + 1}/${products.length}:`, product.codigo_brk) // Debug log

      if (!product.codigo_brk || typeof product.codigo_brk !== "string" || product.codigo_brk.trim() === "") {
        throw new Error(`Falta campo requerido: codigo_brk (valor: "${product.codigo_brk}")`)
      }

      if (!product.sku || typeof product.sku !== "string" || product.sku.trim() === "") {
        const codigo_brk = String(product.codigo_brk || "")
        const marca = String(product.marca || "")
        const linea = String(product.linea || "")
        const modelo = String(product.modelo || "")

        product.sku = `${codigo_brk}${marca}${linea}${modelo}`.replace(/\s+/g, "").toUpperCase()

        // If still empty, use codigo_brk + timestamp as fallback
        if (!product.sku || product.sku.trim() === "") {
          product.sku = `${codigo_brk}_${Date.now()}`.replace(/\s+/g, "").toUpperCase()
        }
      }

      // Upload image if available
      if (images && product.ref_brk) {
        const productCode = String(product.ref_brk).trim()
        console.log(`Looking for image for product code: ${productCode}`) // Debug log

        // Try multiple matching strategies
        let imageKey = Array.from(images.keys()).find((key) => {
          const keyLower = key.toLowerCase()
          const codeLower = productCode.toLowerCase()
          return (
            keyLower.includes(codeLower) ||
            keyLower.startsWith(codeLower) ||
            keyLower === `${codeLower}.jpg` ||
            keyLower === `${codeLower}.png`
          )
        })

        // If not found, try without extension
        if (!imageKey) {
          const codeWithoutExtension = productCode.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "")
          imageKey = Array.from(images.keys()).find((key) => {
            const keyWithoutExt = key.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "")
            return keyWithoutExt.toLowerCase() === codeWithoutExtension.toLowerCase()
          })
        }

        if (imageKey) {
          console.log(`Found matching image for ${productCode}: ${imageKey}`) // Debug log
          const imageBlob = images.get(imageKey)
          if (imageBlob) {
            console.log(`Image blob size: ${imageBlob.size} bytes`) // Debug log
            const imageUrl = await uploadImage(imageBlob, productCode, imageKey)
            if (imageUrl) {
              product.images = [imageUrl]
              console.log(`Successfully uploaded image for ${productCode}: ${imageUrl}`) // Debug log
            } else {
              console.log(`Failed to upload image for ${productCode}`) // Debug log
            }
          }
        } else {
          console.log(`No matching image found for product code: ${productCode}`) // Debug log
          console.log(`Available image keys:`, Array.from(images.keys())) // Debug log
        }
      }

      // Check if product exists first (by SKU, not codigo_brk)
      const { data: existingProduct, error: selectError } = await supabase
        .from("products")
        .select("id")
        .eq("sku", product.sku)
        .single()

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error(`Error checking existing product ${product.codigo_brk}:`, selectError)
        throw selectError
      }

      let uploadError: any = null

      if (existingProduct) {
        // Update existing product by SKU
        console.log(`Updating existing product with SKU: ${product.sku}`) // Debug log
        const { error: updateError } = await supabase.from("products").update(product).eq("sku", product.sku)
        uploadError = updateError
      } else {
        // Insert new product
        console.log(`Inserting new product with SKU: ${product.sku}`) // Debug log
        const { error: insertError } = await supabase.from("products").insert([product])
        uploadError = insertError
      }

      if (uploadError) {
        console.error(`Upload error for product ${product.codigo_brk}:`, uploadError)
        throw uploadError
      }

      success++
      console.log(`Successfully processed product ${i + 1}: ${product.codigo_brk}`) // Debug log
    } catch (error) {
      failed++
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      errors.push(`Row ${i + 1} (${products[i]?.codigo_brk || "unknown"}): ${errorMessage}`)
      console.error(`Error uploading product ${i + 1}:`, error)
    }

    if (onProgress) {
      onProgress(((i + 1) / products.length) * 100)
    }
  }

  console.log(`Upload completed: ${success} successful, ${failed} failed`) // Debug log

  // Save upload history
  const uploadId = `upload_${Date.now()}`
  const uploadRecord: UploadHistory = {
    id: uploadId,
    upload_id: uploadId,
    filename: "bulk_upload.xlsx",
    total_products: products.length,
    successful_products: success,
    failed_products: failed,
    created_at: new Date().toISOString(),
    status: failed === 0 ? "completed" : success === 0 ? "failed" : "partial",
    has_images: images ? images.size > 0 : false,
    errors: errors,
  }

  try {
    await supabase.from("upload_history").insert([uploadRecord])
  } catch (error) {
    console.error("Error saving upload history:", error)
    memoryUploadHistory.push(uploadRecord)
  }

  return {
    success: success > 0,
    message: `Carga completada: ${success} exitosos, ${failed} fallidos`,
    totalProducts: products.length,
    successfulProducts: success,
    failedProducts: failed,
    errors: errors,
  }
}

// Simple upload without images
export async function simpleUpload(
  products: Product[],
  onProgress?: (progress: number) => void,
): Promise<BulkUploadResult> {
  return uploadProductsToSupabase(products, undefined, onProgress)
}

// Get upload history
export async function getUploadHistory(): Promise<UploadHistory[]> {
  const isSupabaseConnected = await checkSupabaseConnection()

  if (!isSupabaseConnected) {
    return memoryUploadHistory
  }

  try {
    const { data, error } = await supabase.from("upload_history").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching upload history:", error)
    return memoryUploadHistory
  }
}

// Rollback upload
export async function rollbackUpload(uploadId: string): Promise<boolean> {
  const isSupabaseConnected = await checkSupabaseConnection()

  if (!isSupabaseConnected) {
    // For memory storage, we can't really rollback, so just clear
    memoryProducts = []
    return true
  }

  try {
    // This is a simplified rollback - in a real scenario you'd need to track which records were added
    const { error } = await supabase.from("upload_history").update({ status: "rolled_back" }).eq("upload_id", uploadId)

    return !error
  } catch (error) {
    console.error("Error rolling back upload:", error)
    return false
  }
}

// Create sample template
export function createSampleTemplate(): Product[] {
  return [
    {
      name: "BRK Performance Pastillas Delanteras Civic Type R",
      description: "Pastillas Delantera para BRK Performance Civic Type R 2020-2023",
      sku: "BRK001BRKPERFORMANCECIVICTYPER",
      category: "Pastillas",
      vendor: "BRK",
      price: 150.0,
      stock: 25,
      images: [],
      subgrupo: "Pastillas",
      codigo_brk: "BRK001",
      ref_brk: "BRK001",
      posicion: "Delantera",
      ref_fmsi_oem: "OEM 45022-TEA-T01",
      marca: "BRK Performance",
      linea: "Civic",
      modelo: "Type R",
      version: "2020-2023",
      largo_mm: 150.5,
      ancho_mm: 65.2,
      espesor_mm: 17.8,
      specifications: {},
    },
    {
      name: "BRK Performance Pastillas Traseras Civic Type R",
      description: "Pastillas Trasera para BRK Performance Civic Type R 2020-2023",
      sku: "BRK002BRKPERFORMANCECIVICTYPER",
      category: "Pastillas",
      vendor: "BRK",
      price: 120.0,
      stock: 30,
      images: [],
      subgrupo: "Pastillas",
      codigo_brk: "BRK002",
      ref_brk: "BRK002",
      posicion: "Trasera",
      ref_fmsi_oem: "OEM 43022-TEA-T01",
      marca: "BRK Performance",
      linea: "Civic",
      modelo: "Type R",
      version: "2020-2023",
      largo_mm: 120.3,
      ancho_mm: 55.1,
      espesor_mm: 15.2,
      specifications: {},
    },
  ]
}

// Get products count for dashboard
export async function getProductsCount(): Promise<number> {
  const isSupabaseConnected = await checkSupabaseConnection()

  if (!isSupabaseConnected) {
    return memoryProducts.length
  }

  try {
    const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true })

    if (error) throw error
    return count || 0
  } catch (error) {
    return memoryProducts.length
  }
}

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  const isSupabaseConnected = await checkSupabaseConnection()

  if (!isSupabaseConnected) {
    return memoryProducts
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .limit(10000)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    return memoryProducts
  }
}
