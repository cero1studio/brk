"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "../src/components/product/ProductCard"
import ProductFilters, { LoadingProvider } from "../src/components/product/ProductFilters"
import SearchBar from "../src/components/product/SearchBar"
import ProductsPagination from "../src/components/product/ProductsPagination"
import ProductsLoading from "../src/components/product/ProductsLoading"
import ProductsLoadingOverlay from "../src/components/product/ProductsLoadingOverlay"
import { supabase } from "../src/lib/supabase"
import type { Product } from "../src/types"
import { Button } from "../src/components/ui/button"

async function getProducts(searchParams?: {
  q?: string
  subgrupo?: string
  marca?: string
  linea?: string
  modelo?: string
  posicion?: string
  codigoBrk?: string
  refFmsiOem?: string
  page?: string
}): Promise<{ products: Product[]; totalCount: number }> {
  const page = Number.parseInt(searchParams?.page || "1")
  const itemsPerPage = 10
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  let query = supabase.from("products").select("*", { count: "exact" }).order("updated_at", { ascending: false })

  if (searchParams?.q) {
    const searchTerm = searchParams.q.toLowerCase()
    query = query.or(
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,ref_fmsi_oem.ilike.%${searchTerm}%,codigo_brk.ilike.%${searchTerm}%,marca.ilike.%${searchTerm}%,linea.ilike.%${searchTerm}%,modelo.ilike.%${searchTerm}%`,
    )
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
    return { products: [], totalCount: 0 }
  }

  const groupedProducts = new Map<string, any>()
  ;(data || []).forEach((item) => {
    const key = item.codigo_brk || item.id

    if (groupedProducts.has(key)) {
      // Merge applications for existing product
      const existing = groupedProducts.get(key)
      
      // Update ALL fields with the latest data
      existing.id = item.id
      existing.name = item.name || existing.name
      existing.description = item.description || existing.description
      existing.price = item.price !== undefined ? item.price : existing.price
      existing.category = item.category || existing.category
      existing.vendor = item.vendor || existing.vendor
      existing.stock = item.stock !== undefined ? item.stock : existing.stock
      existing.sku = item.sku || existing.sku
      existing.updated_at = item.updated_at || existing.updated_at
      
      // Update images if they exist in the new item
      if (item.images && item.images.length > 0) {
        existing.images = Array.isArray(item.images) ? item.images : [item.images]
      }
      
      // Update specifications with latest data
      existing.specifications = {
        refFmsiOem: item.ref_fmsi_oem || existing.specifications.refFmsiOem,
        ref_brk: item.ref_brk || existing.specifications.ref_brk,
        largo_mm: item.largo_mm !== null ? item.largo_mm : existing.specifications.largo_mm,
        ancho_mm: item.ancho_mm !== null ? item.ancho_mm : existing.specifications.ancho_mm,
        espesor_mm: item.espesor_mm !== null ? item.espesor_mm : existing.specifications.espesor_mm,
        diametro_A_mm: item.diametro_a_mm !== null ? item.diametro_a_mm : existing.specifications.diametro_A_mm,
        alto_B_mm: item.alto_b_mm !== null ? item.alto_b_mm : existing.specifications.alto_B_mm,
        subgrupo: item.subgrupo || existing.specifications.subgrupo,
        marca: item.marca || existing.specifications.marca,
        linea: item.linea || existing.specifications.linea,
        modelo: item.modelo || existing.specifications.modelo,
        posicion: item.posicion || existing.specifications.posicion,
        codigoBrk: item.codigo_brk || existing.specifications.codigoBrk,
        version: item.version || existing.specifications.version,
        xJuegoPastilla: item.x_juego_pastilla !== null ? item.x_juego_pastilla : existing.specifications.xJuegoPastilla,
        espesor_C_mm: item.espesor_c_mm !== null ? item.espesor_c_mm : existing.specifications.espesor_C_mm,
        espesor_min_mm: item.espesor_min_mm !== null ? item.espesor_min_mm : existing.specifications.espesor_min_mm,
        agujeros: item.agujeros !== null ? item.agujeros : existing.specifications.agujeros,
        diametro_interno_A_mm: item.diametro_interno_a_mm !== null ? item.diametro_interno_a_mm : existing.specifications.diametro_interno_A_mm,
        diametro_orificio_central_C_mm: item.diametro_orificio_central_c_mm !== null ? item.diametro_orificio_central_c_mm : existing.specifications.diametro_orificio_central_C_mm,
        altura_total_D_mm: item.altura_total_d_mm !== null ? item.altura_total_d_mm : existing.specifications.altura_total_D_mm,
        diametro_interno_maximo: item.diametro_interno_maximo !== null ? item.diametro_interno_maximo : existing.specifications.diametro_interno_maximo,
        equivalencias: item.equivalencias || existing.specifications.equivalencias,
      }
      
      if (item.marca) {
        existing.aplicaciones.push({
          serie: item.modelo || "",
          litros: item.version || "",
          ano: "",
          especificacionVehiculo: `${item.marca} ${item.linea || ""} ${item.modelo || ""}`.trim(),
          eje: item.posicion || "",
          isHighlighted: false,
        })
      }
    } else {
      // Create new product entry
      groupedProducts.set(key, {
        id: item.id,
        name: item.name || "",
        description: item.description || "",
        price: item.price || 0,
        category: item.category || "",
        vendor: item.vendor || "",
        stock: item.stock || 0,
        sku: item.sku || "",
        images: item.images ? (Array.isArray(item.images) ? item.images : [item.images]) : [],
        updated_at: item.updated_at,
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
      })
    }
  })

  const allProducts = Array.from(groupedProducts.values())
  const totalCount = allProducts.length
  const products = allProducts.slice(from, to)

  return { products, totalCount }
}

function HomePageContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPageChanging, setIsPageChanging] = useState(false)
  const [showCatalog, setShowCatalog] = useState(false)

  // Verificar si ya está autenticado al cargar la página
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('brk_catalog_authenticated')
    if (isAuthenticated === 'true') {
      setShowCatalog(true)
    }
  }, [])

  // Escuchar el evento de logout desde el header
  useEffect(() => {
    const handleCatalogLogout = () => {
      setShowCatalog(false)
    }

    window.addEventListener('catalogLogout', handleCatalogLogout)
    return () => window.removeEventListener('catalogLogout', handleCatalogLogout)
  }, [])

  const searchParamsObj = {
    q: searchParams.get("q") || undefined,
    subgrupo: searchParams.get("subgrupo") || undefined,
    marca: searchParams.get("marca") || undefined,
    linea: searchParams.get("linea") || undefined,
    modelo: searchParams.get("modelo") || undefined,
    posicion: searchParams.get("posicion") || undefined,
    codigoBrk: searchParams.get("codigoBrk") || undefined,
    refFmsiOem: searchParams.get("refFmsiOem") || undefined,
    page: searchParams.get("page") || undefined,
  }

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      const { products: newProducts, totalCount: newTotalCount } = await getProducts(searchParamsObj)
      setProducts(newProducts)
      setTotalCount(newTotalCount)
      setIsLoading(false)
      setIsPageChanging(false)
    }

    loadProducts()
    
    // Reload products when the page becomes visible (user returns from admin)
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        const { products: newProducts, totalCount: newTotalCount } = await getProducts(searchParamsObj)
        setProducts(newProducts)
        setTotalCount(newTotalCount)
      }
    }
    
    // Reload products every 30 seconds to catch updates
    const interval = setInterval(async () => {
      const { products: newProducts, totalCount: newTotalCount } = await getProducts(searchParamsObj)
      setProducts(newProducts)
      setTotalCount(newTotalCount)
    }, 30000)
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [searchParams.toString()])

  const query = searchParamsObj.q
  const hasFilters = Object.keys(searchParamsObj).some(
    (key) =>
      key !== "q" &&
      key !== "page" &&
      searchParamsObj[key as keyof typeof searchParamsObj] &&
      !searchParamsObj[key as keyof typeof searchParamsObj]?.startsWith("all_"),
  )

  const currentPage = Number.parseInt(searchParamsObj.page || "1")
  const itemsPerPage = 10
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handlePageChange = (page: number) => {
    setIsPageChanging(true)
  }

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const password = (e.target as HTMLFormElement).password.value
    if (password === "catalogo2025") {
      setShowCatalog(true)
      localStorage.setItem('brk_catalog_authenticated', 'true')
    } else {
      alert("Contraseña incorrecta")
    }
  }

  // Si no está autenticado, mostrar formulario de login
  if (!showCatalog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          {/* Título principal */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-3">
              ¡Bienvenido a nuestro catálogo!
            </h2>
          </div>

          {/* Formulario de acceso */}
          <div className="bg-gray-900 rounded-xl shadow-2xl p-8 border border-gray-700">
            <div className="text-center mb-6">
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña de acceso
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Ingresa tu contraseña aquí"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-blue-500"
              >
                🚀 Acceder
              </button>
            </form>

            {/* Información adicional */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-2">Categorías disponibles:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs border border-gray-600">Campanas</span>
                  <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs border border-gray-600">Cilindros</span>
                  <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs border border-gray-600">Discos</span>
                  <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs border border-gray-600">Pastillas</span>
                  <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs border border-gray-600">Sensores</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <LoadingProvider setIsLoading={setIsLoading}>
      <div className="container mx-auto px-4 py-8">
        {isPageChanging && <ProductsLoadingOverlay />}

        <section className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-3 text-foreground">
            Bienvenido a BRK Performance Brakes
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-body">
            Su proveedor principal de soluciones de frenado de alto rendimiento.
          </p>
        </section>

        <section className="mb-10 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <SearchBar />
            </div>
            <Button 
              onClick={async () => {
                setIsLoading(true)
                const { products: newProducts, totalCount: newTotalCount } = await getProducts(searchParamsObj)
                setProducts(newProducts)
                setTotalCount(newTotalCount)
                setIsLoading(false)
              }}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              🔄 Actualizar
            </Button>
          </div>
          <ProductFilters />
        </section>

        <section id="results-section">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-headline font-semibold text-center md:text-left text-foreground">
              {query || hasFilters ? "Resultados de Búsqueda" : "Catálogo de Productos"}
            </h2>
            {totalCount > 0 && !isLoading && (
              <p className="text-sm text-muted-foreground">
                {totalCount} producto{totalCount !== 1 ? "s" : ""} encontrado{totalCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {isLoading ? (
            <ProductsLoading />
          ) : products.length > 0 ? (
            <>
              <div className="space-y-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <ProductsPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                No se encontraron productos que coincidan con sus criterios.
              </p>
            </div>
          )}
        </section>
      </div>
    </LoadingProvider>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <HomePageContent />
    </Suspense>
  )
}
