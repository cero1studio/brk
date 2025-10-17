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
              subgrupo: row[0]?.toString().trim() || "",
              codigo_brk: row[1]?.toString().trim() || "",
              ref_brk: row[2]?.toString().trim() || "",
              posicion: row[3]?.toString().trim() || "",
              ref_fmsi_oem: row[4]?.toString().trim() || "",
              marca: row[5]?.toString().trim() || "",
              linea: row[6]?.toString().trim() || "",
              modelo: row[7]?.toString().trim() || "",
              version: row[8]?.toString().trim() || "",
              largo_mm: row[9] ? Number(row[9]) : null,
              ancho_mm: row[10] ? Number(row[10]) : null,
              espesor_mm: row[11] ? Number(row[11]) : null,
              diametro_a_mm: row[12] ? Number(row[12]) : null,
              alto_b_mm: row[13] ? Number(row[13]) : null,
              espesor_c_mm: row[14] ? Number(row[14]) : null,
              espesor_min_mm: row[15] ? Number(row[15]) : null,
              agujeros: row[16] ? Number(row[16]) : 0,
              diametro_interno_a_mm: row[17] ? Number(row[17]) : null,
              diametro_orificio_central_c_mm: row[18] ? Number(row[18]) : null,
              altura_total_d_mm: row[19] ? Number(row[19]) : null,
              agujeros4: row[20]?.toString().trim() || "",
              diametro_interno_maximo: row[21] ? Number(row[21]) : null,
              diametro: row[22] ? Number(row[22]) : null,
              largo: row[23] ? Number(row[23]) : null,
              x_juego_pastilla: row[24] ? Number(row[24]) : 0,
              largo_mm10: row[25] ? Number(row[25]) : null,
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
  console.log(`\n[ZIP Parse] ===== STARTING ZIP FILE PROCESSING =====`)
  console.log(`[ZIP Parse] 📁 ZIP file name: ${file.name}`)
  console.log(`[ZIP Parse] 📏 ZIP file size: ${file.size} bytes (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
  console.log(`[ZIP Parse] 📅 ZIP file type: ${file.type}`)
  console.log(`[ZIP Parse] 📅 ZIP file last modified: ${new Date(file.lastModified).toLocaleString()}`)
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        console.log(`[ZIP Parse] ✅ FileReader loaded successfully`)
        console.log(`[ZIP Parse] 📊 ArrayBuffer size: ${e.target?.result?.byteLength} bytes`)
        
        console.log(`[ZIP Parse] 🔄 Starting JSZip processing...`)
  const zip = new JSZip()
        const zipData = await zip.loadAsync(e.target?.result as ArrayBuffer)
        
        console.log(`[ZIP Parse] ✅ ZIP file loaded successfully!`)
        console.log(`[ZIP Parse] 📦 Total files in ZIP: ${Object.keys(zipData.files).length}`)
        console.log(`[ZIP Parse] 📋 All files in ZIP:`, Object.keys(zipData.files))
        
  const imagesByFolder = new Map<string, Blob>()
        let processedFiles = 0
        let imageFiles = 0
        let skippedFiles = 0
        let invalidImageFiles = 0
        let validImageFiles = 0

        console.log(`[ZIP Parse] 🔍 Starting file analysis...`)
        
        for (const [filename, file] of Object.entries(zipData.files)) {
          processedFiles++
          console.log(`\n[ZIP Parse] 📄 Processing file ${processedFiles}/${Object.keys(zipData.files).length}: ${filename}`)
          console.log(`[ZIP Parse] 📄 File is directory: ${file.dir}`)
          console.log(`[ZIP Parse] 📄 File size: ${file._data?.uncompressedSize || 'unknown'} bytes`)
          
          if (file.dir) {
            console.log(`[ZIP Parse] ⏭️ Skipping directory: ${filename}`)
            skippedFiles++
      continue
    }

    // Check if it's an image file
          const isImageFile = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)
          console.log(`[ZIP Parse] 🖼️ Is image file: ${isImageFile}`)
          
          if (isImageFile) {
            imageFiles++
            console.log(`[ZIP Parse] ✅ Found image file: ${filename}`)
            
            try {
              const blob = await file.async("blob")
              console.log(`[ZIP Parse] 📦 Extracted blob - size: ${blob.size} bytes, type: ${blob.type}`)
              
              // Extract ref_brk from filename (e.g., "REF001.webp" -> "REF001")
              const refBrk = filename.split("/").pop()?.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "") || ""
              console.log(`[ZIP Parse] 🏷️ Extracted ref_brk: "${refBrk}"`)
              
              if (refBrk && refBrk.length > 0) {
                imagesByFolder.set(refBrk, blob)
                validImageFiles++
                console.log(`[ZIP Parse] ✅ Added to map: ${refBrk} -> blob (${blob.size} bytes)`)
              } else {
                invalidImageFiles++
                console.log(`[ZIP Parse] ❌ No valid ref_brk extracted from: ${filename}`)
              }
            } catch (blobError) {
              invalidImageFiles++
              console.error(`[ZIP Parse] ❌ Error extracting blob from ${filename}:`, blobError)
            }
          } else {
            console.log(`[ZIP Parse] ⏭️ Skipping non-image file: ${filename}`)
            skippedFiles++
          }
        }

        console.log(`\n[ZIP Parse] ===== ZIP PROCESSING COMPLETED =====`)
        console.log(`[ZIP Parse] 📊 SUMMARY:`)
        console.log(`[ZIP Parse] 📄 Total files processed: ${processedFiles}`)
        console.log(`[ZIP Parse] 🖼️ Image files found: ${imageFiles}`)
        console.log(`[ZIP Parse] ✅ Valid images with ref_brk: ${validImageFiles}`)
        console.log(`[ZIP Parse] ❌ Invalid images (no ref_brk): ${invalidImageFiles}`)
        console.log(`[ZIP Parse] ⏭️ Skipped files: ${skippedFiles}`)
        console.log(`[ZIP Parse] 🏷️ Final ref_brk list:`, Array.from(imagesByFolder.keys()))
        console.log(`[ZIP Parse] 📦 Map size: ${imagesByFolder.size}`)
        console.log(`[ZIP Parse] =========================================\n`)
        
        resolve(imagesByFolder)
      } catch (error) {
        console.error(`[ZIP Parse] ❌ Error processing ZIP:`, error)
        console.error(`[ZIP Parse] ❌ Error details:`, {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
        reject(error)
      }
    }
    reader.onerror = () => {
      console.error(`[ZIP Parse] ❌ FileReader error`)
      reject(new Error("Error reading ZIP file"))
    }
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100
        console.log(`[ZIP Parse] 📊 Reading progress: ${percentComplete.toFixed(1)}%`)
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

// Upload image to Supabase Storage
async function uploadImageToStorage(folderName: string, imageBlob: Blob): Promise<string> {
  console.log(`[Image Upload] ===== Starting upload process =====`)
  console.log(`[Image Upload] Folder name: ${folderName}`)
  console.log(`[Image Upload] Blob size: ${imageBlob.size} bytes`)
  console.log(`[Image Upload] Blob type: ${imageBlob.type}`)
  console.log(`[Image Upload] Blob constructor:`, imageBlob.constructor.name)
  
  // Use same bucket and naming convention as individual upload
  const timestamp = Date.now()
  const fileName = `product_${timestamp}_${folderName}.webp`
  
  console.log(`[Image Upload] Generated filename: ${fileName}`)
  console.log(`[Image Upload] Target bucket: "products"`)
  console.log(`[Image Upload] Supabase client:`, !!supabase)
  console.log(`[Image Upload] Storage client:`, !!supabase.storage)
  
  // Test bucket access first
  console.log(`[Image Upload] Testing bucket access...`)
  try {
    const { data: bucketList, error: bucketError } = await supabase.storage.listBuckets()
    console.log(`[Image Upload] Available buckets:`, bucketList?.map(b => b.name))
    if (bucketError) {
      console.error(`[Image Upload] Bucket list error:`, bucketError)
    }
  } catch (err) {
    console.error(`[Image Upload] Error listing buckets:`, err)
  }
  
  console.log(`[Image Upload] Attempting upload to bucket "products"...`)
  const { data, error } = await supabase.storage
    .from("products")  // Same bucket as individual upload
    .upload(fileName, imageBlob, {
      contentType: "image/webp",
      upsert: true,  // Allow overwrite like individual upload
    })

    if (error) {
    console.error(`[Image Upload] ❌ Upload error:`, error)
    console.error(`[Image Upload] Error details:`, {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error
    })
    throw new Error(`Error uploading image: ${error.message}`)
  }

  console.log(`[Image Upload] ✅ Upload successful!`)
  console.log(`[Image Upload] Upload response data:`, data)

  console.log(`[Image Upload] Generating public URL...`)
  const { data: { publicUrl } } = supabase.storage
    .from("products")  // Same bucket as individual upload
    .getPublicUrl(fileName)

  console.log(`[Image Upload] ✅ Generated public URL: ${publicUrl}`)
  console.log(`[Image Upload] ===== Upload process completed =====`)
    return publicUrl
}

// Upload products to Supabase
export async function uploadProductsToSupabase(
  products: Product[],
  imagesByFolder: Map<string, Blob>,
  onProgress?: (progress: number) => void,
  onLog?: (message: string) => void
): Promise<BulkUploadResult> {
  console.log(`\n[Bulk Upload] ===== STARTING BULK UPLOAD PROCESS =====`)
  console.log(`[Bulk Upload] 📦 Products to process: ${products.length}`)
  console.log(`[Bulk Upload] 🖼️ Images available: ${imagesByFolder.size}`)
  console.log(`[Bulk Upload] 🏷️ Image codes found:`, Array.from(imagesByFolder.keys()))
  console.log(`[Bulk Upload] 📊 Products with matching images:`, products.filter(p => imagesByFolder.has(p.codigo_brk)).length)
  console.log(`[Bulk Upload] ===========================================\n`)
  
  onLog?.(`📦 Procesando ${products.length} productos`)
  onLog?.(`🖼️ Imágenes disponibles: ${imagesByFolder.size}`)
  onLog?.(`📊 Productos con imágenes: ${products.filter(p => p.ref_brk && imagesByFolder.has(p.ref_brk)).length}`)

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
    console.log(`\n[Bulk Upload] ===== Processing product ${i + 1}/${products.length} =====`)
    console.log(`[Bulk Upload] Product codigo_brk: ${product.codigo_brk}`)
    console.log(`[Bulk Upload] Product name: ${product.name}`)
    
    onLog?.(`📦 Procesando producto ${i + 1}/${products.length}: ${product.codigo_brk}`)
    
    try {
      // Upload images if available
      console.log(`[Bulk Upload] Step 1: Checking if image exists for ref_brk: ${product.ref_brk}`)
      console.log(`[Bulk Upload] Available image codes:`, Array.from(imagesByFolder.keys()))
      console.log(`[Bulk Upload] Has image for ${product.ref_brk}:`, imagesByFolder.has(product.ref_brk))
      
      if (product.ref_brk && imagesByFolder.has(product.ref_brk)) {
        console.log(`[Bulk Upload] Step 2: 🖼️ IMAGE FOUND! Starting image processing`)
        console.log(`[Bulk Upload] Step 2a: Retrieving image blob for ref_brk: ${product.ref_brk}`)
        const imageBlob = imagesByFolder.get(product.ref_brk)!
        console.log(`[Bulk Upload] Step 2b: Blob retrieved - size: ${imageBlob.size} bytes, type: ${imageBlob.type}`)
        
        onLog?.(`🖼️ Imagen encontrada para ${product.ref_brk} (${imageBlob.size} bytes)`)
        
        console.log(`[Bulk Upload] Step 3: 🚀 CALLING uploadImageToStorage function`)
        console.log(`[Bulk Upload] Step 3a: Parameters - ref_brk: ${product.ref_brk}, blob size: ${imageBlob.size}`)
        onLog?.(`🚀 Subiendo imagen a Supabase Storage...`)
        const imageUrl = await uploadImageToStorage(product.ref_brk, imageBlob)
        console.log(`[Bulk Upload] Step 3b: uploadImageToStorage returned URL: ${imageUrl}`)
        
        console.log(`[Bulk Upload] Step 4: 🔗 ASSIGNING URL TO PRODUCT`)
        console.log(`[Bulk Upload] Step 4a: Before assignment - product.images:`, product.images)
        product.images = [imageUrl]
        console.log(`[Bulk Upload] Step 4b: After assignment - product.images:`, product.images)
        console.log(`[Bulk Upload] Step 4c: URL successfully linked to product ${product.codigo_brk}`)
        console.log(`[Bulk Upload] Step 4d: Product images type:`, typeof product.images)
        console.log(`[Bulk Upload] Step 4e: Product images length:`, product.images?.length)
        
        onLog?.(`✅ Imagen subida y URL asignada: ${imageUrl.substring(0, 50)}...`)
      } else {
        console.log(`[Bulk Upload] Step 2: ❌ NO IMAGE FOUND for ref_brk: ${product.ref_brk}`)
        console.log(`[Bulk Upload] Step 2a: Available image codes:`, Array.from(imagesByFolder.keys()))
        console.log(`[Bulk Upload] Step 2b: Product images will remain empty:`, product.images)
        
        onLog?.(`⚠️ No se encontró imagen para ${product.ref_brk}`)
      }

      // Check if this specific product combination exists (codigo_brk + marca + linea + modelo + posicion + version)
      console.log(`[Bulk Upload] Step 5: Checking if specific product exists: ${product.codigo_brk} - ${product.marca} ${product.linea} ${product.modelo} ${product.posicion} ${product.version}`)
      const { data: existingProduct, error: checkError } = await supabase
        .from("products")
        .select("id")
        .eq("codigo_brk", product.codigo_brk)
        .eq("marca", product.marca)
        .eq("linea", product.linea)
        .eq("modelo", product.modelo)
        .eq("posicion", product.posicion)
        .eq("version", product.version)
        .limit(1)
      
      if (checkError) {
        console.error(`[Bulk Upload] ❌ Error checking existing product:`, checkError)
        throw new Error(checkError.message)
      }
      
      console.log(`[Bulk Upload] Step 6: Database check result - exists:`, existingProduct && existingProduct.length > 0)
      console.log(`[Bulk Upload] Step 6a: 📊 PRODUCT DATA TO SAVE:`)
      console.log(`[Bulk Upload] Step 6b: - codigo_brk: ${product.codigo_brk}`)
      console.log(`[Bulk Upload] Step 6c: - name: ${product.name}`)
      console.log(`[Bulk Upload] Step 6d: - marca: ${product.marca}`)
      console.log(`[Bulk Upload] Step 6e: - linea: ${product.linea}`)
      console.log(`[Bulk Upload] Step 6f: - modelo: ${product.modelo}`)
      console.log(`[Bulk Upload] Step 6g: - posicion: ${product.posicion}`)
      console.log(`[Bulk Upload] Step 6h: - version: ${product.version}`)
      console.log(`[Bulk Upload] Step 6i: - images:`, product.images)
      
      if (existingProduct && existingProduct.length > 0) {
        // This specific product combination exists, update it
        console.log(`[Bulk Upload] Step 7: 🔄 SPECIFIC PRODUCT EXISTS - UPDATING in database`)
        console.log(`[Bulk Upload] Step 7a: Updating specific product combination`)
        console.log(`[Bulk Upload] Step 7b: Update data includes images:`, product.images)
        console.log(`[Bulk Upload] Step 7c: Executing UPDATE query...`)
        
        onLog?.(`🔄 Actualizando producto específico: ${product.codigo_brk} - ${product.marca} ${product.linea} ${product.modelo}`)
        
        const { error: updateError } = await supabase
          .from("products")
          .update(product)
          .eq("codigo_brk", product.codigo_brk)
          .eq("marca", product.marca)
          .eq("linea", product.linea)
          .eq("modelo", product.modelo)
          .eq("posicion", product.posicion)
          .eq("version", product.version)
        
        if (updateError) {
          console.error(`[Bulk Upload] ❌ Update error for specific product:`, updateError)
          throw new Error(updateError.message)
        }
        console.log(`[Bulk Upload] ✅ Step 7d: Specific product updated successfully in database`)
        console.log(`[Bulk Upload] ✅ Step 7e: Images URL saved to database:`, product.images)
        
        onLog?.(`✅ Producto específico actualizado en base de datos`)
      } else {
        // This specific product combination doesn't exist, insert it
        console.log(`[Bulk Upload] Step 7: ➕ SPECIFIC PRODUCT DOESN'T EXIST - INSERTING new`)
        console.log(`[Bulk Upload] Step 7a: Inserting new specific product combination`)
        console.log(`[Bulk Upload] Step 7b: Insert data includes images:`, product.images)
        console.log(`[Bulk Upload] Step 7c: Executing INSERT query...`)
        
        onLog?.(`➕ Insertando nuevo producto específico: ${product.codigo_brk} - ${product.marca} ${product.linea} ${product.modelo}`)
        
        const { error: insertError } = await supabase.from("products").insert([product])
        
        if (insertError) {
          console.error(`[Bulk Upload] ❌ Insert error for specific product:`, insertError)
          throw new Error(insertError.message)
        }
        console.log(`[Bulk Upload] ✅ Step 7d: Specific product inserted successfully in database`)
        console.log(`[Bulk Upload] ✅ Step 7e: Images URL saved to database:`, product.images)
        
        onLog?.(`✅ Producto específico insertado en base de datos`)
      }

      result.success++
      console.log(`[Bulk Upload] ✅ Product ${i + 1}/${products.length} completed successfully!`)
    } catch (error) {
      result.errors++
      result.errorDetails?.push(`Producto ${i + 1} (${product.codigo_brk}): ${error}`)
      console.error(`[Bulk Upload] ❌ Product ${i + 1}/${products.length} failed:`, error)
    }

    // Update progress
    const progress = Math.round(((i + 1) / products.length) * 100)
    console.log(`[Bulk Upload] 📊 Progress: ${progress}% (${i + 1}/${products.length})`)
    onProgress?.(progress)
  }

  result.success = result.success === products.length
  result.message = `Procesados ${result.total} productos. ${result.success} exitosos (insertados/actualizados), ${result.errors} con errores.`

  console.log(`\n[Bulk Upload] ===== FINAL RESULTS =====`)
  console.log(`[Bulk Upload] Total products processed: ${result.total}`)
  console.log(`[Bulk Upload] Successful: ${result.success}`)
  console.log(`[Bulk Upload] Errors: ${result.errors}`)
  console.log(`[Bulk Upload] Success rate: ${Math.round((result.success / result.total) * 100)}%`)
  if (result.errorDetails && result.errorDetails.length > 0) {
    console.log(`[Bulk Upload] Error details:`)
    result.errorDetails.forEach((error, index) => {
      console.log(`[Bulk Upload] Error ${index + 1}: ${error}`)
    })
  }
  console.log(`[Bulk Upload] ===== PROCESS COMPLETED =====\n`)

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
    console.log("🔍 getAllProducts: Iniciando consulta a la base de datos...")
    
    // Primero obtener el conteo total
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error getting count:", countError)
    } else {
      console.log(`📊 Total de productos en la base de datos: ${count}`)
    }

    // Obtener todos los productos sin límite
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10000) // Límite alto para asegurar que obtenemos todos

    if (error) {
      console.error("Error fetching products:", error)
      return []
    }

    console.log(`✅ getAllProducts: Obtenidos ${data?.length || 0} productos`)
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
      "SUBGRUPO",
      "CÓDIGOBRK",
      "REF BRK",
      "POSICIÓN",
      "REF FMSI / OEM",
      "MARCA",
      "LÍNEA",
      "MODELO",
      "VERSIÓN",
      "LARGO (mm)",
      "ANCHO (mm)",
      "ESPESOR (mm)",
      "DIÁMETRO (A) mm",
      "ALTO (B) mm",
      "ESPESOR (C) mm",
      "ESPESOR MIN, mm",
      "AGUJEROS",
      "DIÁMETRO INTERNO (A) mm",
      "DIAMETRO ORIFICIO CENTRAL (C) mm",
      "ALTURA TOTAL (D) mm",
      "AGUJEROS4",
      "DIÁMETRO INTERNO MÁXIMO",
      "DIÁMETRO",
      "LARGO",
      "X JUEGO PASTILLA",
      "LARGO (mm)10",
    ],
    [
      "PASTILLAS",
      "11795",
      "REF001",
      "DELANTERO",
      "FMSI123",
      "AUDI",
      "GOLF IV",
      "2019",
      "V1",
      "95.5",
      "43",
      "16",
      "",
      "",
      "",
      "",
      "0",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "0",
      "",
    ],
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(sampleData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Productos")

  XLSX.writeFile(workbook, "plantilla_productos_brk.xlsx")
}