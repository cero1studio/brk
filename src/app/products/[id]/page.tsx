import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import ProductDetailView from "@/components/product/ProductDetailView"
import type { Product } from "@/types"

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getProduct(id: string): Promise<Product | null> {
  try {
    console.log("🔍 Fetching product with ID:", id)

    const { data: product, error } = await supabase.from("products").select("*").eq("id", id).order("updated_at", { ascending: false }).single()

    if (error) {
      console.error("❌ Supabase error:", error)
      return null
    }

    if (!product) {
      console.log("❌ No product found with ID:", id)
      return null
    }

    const { data: relatedProducts, error: relatedError } = await supabase
      .from("products")
      .select("*")
      .eq("codigo_brk", product.codigo_brk)

    if (relatedError) {
      console.error("❌ Error fetching related products:", relatedError)
    }
    
    // Log related products to see their structure
    if (relatedProducts && relatedProducts.length > 0) {
      console.log("🔍 Related products from database:", relatedProducts.slice(0, 3).map(p => ({
        id: p.id,
        marca: p.marca,
        linea: p.linea,
        modelo: p.modelo,
        version: p.version,
        posicion: p.posicion
      })))
    }

    console.log("✅ Product found:", product.name)
    console.log("🔍 Single Product - Raw data from database:", {
      id: product.id,
      marca: product.marca,
      linea: product.linea,
      modelo: product.modelo,
      version: product.version,
      posicion: product.posicion,
      codigo_brk: product.codigo_brk,
      updated_at: product.updated_at
    })
    
    // Log to see if linea contains "S" or if modelo contains "S"
    console.log("🔍 Database field analysis:", {
      "linea field contains": product.linea,
      "modelo field contains": product.modelo,
      "version field contains": product.version,
      "linea length": product.linea?.length,
      "modelo length": product.modelo?.length
    })

    // Transform the database product to our Product type
    const transformedProduct: Product = {
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      category: product.category || "",
      vendor: product.vendor || "",
      stock: product.stock || 0,
      sku: product.sku || "",
      images: product.images ? (Array.isArray(product.images) ? product.images : [product.images]) : [],
      updated_at: product.updated_at,
      specifications: {
        refFmsiOem: product.ref_fmsi_oem || "",
        largo_mm: product.largo_mm,
        ancho_mm: product.ancho_mm,
        espesor_mm: product.espesor_mm,
        diametro_A_mm: product.diametro_a_mm,
        alto_B_mm: product.alto_b_mm,
        subgrupo: product.subgrupo,
        marca: product.marca,
        linea: product.linea,
        modelo: product.modelo,
        posicion: product.posicion,
        codigoBrk: product.codigo_brk,
        version: product.version,
        xJuegoPastilla: product.x_juego_pastilla,
        espesor_C_mm: product.espesor_c_mm,
        espesor_min_mm: product.espesor_min_mm,
        agujeros: product.agujeros,
        diametro_interno_A_mm: product.diametro_interno_a_mm,
        diametro_orificio_central_C_mm: product.diametro_orificio_central_c_mm,
        altura_total_D_mm: product.altura_total_d_mm,
        diametro_interno_maximo: product.diametro_interno_maximo,
        equivalencias: product.equivalencias,
      },
      aplicaciones:
        relatedProducts && relatedProducts.length > 0
          ? relatedProducts
              .filter((p) => p.marca && p.modelo)
              .map((p) => ({
                serie: p.modelo || "",
                litros: p.version || "",
                ano: "",
                especificacionVehiculo: `${p.marca} ${p.linea || ""} ${p.modelo || ""}`.trim(),
                eje: p.posicion || "",
                marca: p.marca || "",
                linea: p.linea || "",
                modelo: p.modelo || "",
                isHighlighted: false,
              }))
              .filter(
                (app, index, self) =>
                  index ===
                  self.findIndex((a) => a.especificacionVehiculo === app.especificacionVehiculo && a.eje === app.eje),
              )
          : product.marca && product.modelo
            ? [
                {
                  serie: product.modelo || "",
                  litros: product.version || "",
                  ano: "",
                  especificacionVehiculo: `${product.marca} ${product.linea || ""} ${product.modelo || ""}`.trim(),
                  eje: product.posicion || "",
                  marca: product.marca || "",
                  linea: product.linea || "",
                  modelo: product.modelo || "",
                  isHighlighted: false,
                },
              ]
            : [],
    }

    console.log("🔍 Single Product - Transformed data:", {
      id: transformedProduct.id,
      name: transformedProduct.name,
      marca: transformedProduct.specifications?.marca,
      linea: transformedProduct.specifications?.linea,
      modelo: transformedProduct.specifications?.modelo,
      codigoBrk: transformedProduct.specifications?.codigoBrk,
      updated_at: transformedProduct.updated_at
    })

    return transformedProduct
  } catch (error) {
    console.error("❌ Error fetching product:", error)
    return null
  }
}

// Generate static params for known products
export async function generateStaticParams() {
  try {
    const { data: products } = await supabase.from("products").select("id").limit(100) // Limit to avoid too many static pages

    return (
      products?.map((product) => ({
        id: product.id,
      })) || []
    )
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return <ProductDetailView product={product} />
}
