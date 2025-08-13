import ProductCard from "@/components/product/ProductCard"
import ProductFilters from "@/components/product/ProductFilters"
import SearchBar from "@/components/product/SearchBar"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/types"

async function getProducts(searchParams?: {
  q?: string
  subgrupo?: string
  marca?: string
  linea?: string
  modelo?: string
  posicion?: string
  codigoBrk?: string
  refFmsiOem?: string
}): Promise<Product[]> {
  let query = supabase.from("products").select("*")

  if (searchParams?.q) {
    const searchTerm = searchParams.q.toLowerCase()
    query = query.or(`
      name.ilike.%${searchTerm}%,
      description.ilike.%${searchTerm}%,
      sku.ilike.%${searchTerm}%,
      ref_fmsi_oem.ilike.%${searchTerm}%
    `)
  }

  if (searchParams?.subgrupo && searchParams.subgrupo !== "all_subgrupos") {
    query = query.eq("subgrupo", searchParams.subgrupo)
  }
  if (searchParams?.marca && searchParams.marca !== "all_marcas") {
    query = query.eq("marca", searchParams.marca)
  }
  if (searchParams?.linea && searchParams.linea !== "all_lineas") {
    query = query.eq("linea", searchParams.linea)
  }
  if (searchParams?.modelo && searchParams.modelo !== "all_modelos") {
    query = query.eq("modelo", searchParams.modelo)
  }
  if (searchParams?.posicion && searchParams.posicion !== "all_posiciones") {
    query = query.eq("posicion", searchParams.posicion)
  }
  if (searchParams?.codigoBrk && searchParams.codigoBrk !== "all_codigos_brk") {
    query = query.eq("codigo_brk", searchParams.codigoBrk)
  }
  if (searchParams?.refFmsiOem && searchParams.refFmsiOem !== "all_refs_fmsi_oem") {
    query = query.eq("ref_fmsi_oem", searchParams.refFmsiOem)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return (data || []).map((item) => ({
    id: item.id,
    name: item.name || "",
    description: item.description || "",
    price: item.price || 0,
    category: item.category || "",
    vendor: item.vendor || "",
    stock: item.stock || 0,
    sku: item.sku || "",
    images: item.images ? (Array.isArray(item.images) ? item.images : [item.images]) : [],
    specifications: {
      refFmsiOem: item.ref_fmsi_oem || "",
      ref_brk: item.ref_brk || "",
      largo_mm: item.largo_mm,
      ancho_mm: item.ancho_mm,
      espesor_mm: item.espesor_mm,
      diametro_A_mm: item.diametro_a_mm,
      alto_B_mm: item.alto_b_mm,
      subgrupo: item.subgrupo,
      marca: item.marca,
      linea: item.linea,
      modelo: item.modelo,
      posicion: item.posicion,
      codigoBrk: item.codigo_brk,
      version: item.version,
      xJuegoPastilla: item.x_juego_pastilla,
      espesor_C_mm: item.espesor_c_mm,
      espesor_min_mm: item.espesor_min_mm,
      agujeros: item.agujeros,
      diametro_interno_A_mm: item.diametro_interno_a_mm,
      diametro_orificio_central_C_mm: item.diametro_orificio_central_c_mm,
      altura_total_D_mm: item.altura_total_d_mm,
      diametro_interno_maximo: item.diametro_interno_maximo,
      equivalencias: item.equivalencias,
    },
    // Las aplicaciones se generan basadas en la marca, linea y modelo del producto
    aplicaciones: item.marca
      ? [
          {
            serie: item.modelo || "",
            litros: item.version || "",
            ano: "",
            especificacionVehiculo: `${item.marca} ${item.linea || ""} ${item.modelo || ""}`.trim(),
            eje: item.posicion || "",
            isHighlighted: false,
          },
        ]
      : [],
  }))
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: {
    q?: string
    subgrupo?: string
    marca?: string
    linea?: string
    modelo?: string
    posicion?: string
    codigoBrk?: string
    refFmsiOem?: string
  }
}) {
  const products = await getProducts(searchParams)
  const query = searchParams?.q
  const hasFilters = Object.keys(searchParams || {}).some(
    (key) =>
      key !== "q" &&
      searchParams?.[key as keyof typeof searchParams] &&
      !searchParams[key as keyof typeof searchParams]?.startsWith("all_"),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-3 text-foreground">
          Bienvenido a BRK Performance Brakes
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-body">
          Su proveedor principal de soluciones de frenado de alto rendimiento.
        </p>
      </section>

      <section className="mb-10 space-y-6">
        <SearchBar />
        <ProductFilters />
      </section>

      <section>
        <h2 className="text-3xl font-headline font-semibold mb-8 text-center md:text-left text-foreground">
          {query || hasFilters ? "Resultados de Búsqueda" : "Catálogo de Productos"}
        </h2>
        {products.length > 0 ? (
          <div className="space-y-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No se encontraron productos que coincidan con sus criterios.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
