import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import ProductDetailView from "@/components/product/ProductDetailView"
import type { Product } from "@/types"

async function getProduct(id: string): Promise<Product | null> {
  try {
    console.log("🔍 Fetching product with ID:", id)

    const { data: product, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      console.error("❌ Supabase error:", error)
      return null
    }

    if (!product) {
      console.log("❌ No product found with ID:", id)
      return null
    }

    console.log("✅ Product found:", product.name)

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
      // Generate applications based on product's marca, modelo, version
      aplicaciones:
        product.marca && product.modelo
          ? [
              {
                serie: product.modelo || "",
                litros: product.version || "",
                ano: "",
                especificacionVehiculo: `${product.marca} ${product.linea || ""} ${product.modelo || ""}`.trim(),
                eje: product.posicion || "",
                isHighlighted: false,
              },
            ]
          : [],
    }

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
