"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface LoadingContextType {
  setIsLoading: (loading: boolean) => void
}

import { createContext, useContext } from "react"
const LoadingContext = createContext<LoadingContextType | null>(null)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    return { setIsLoading: () => {} } // Fallback if context not available
  }
  return context
}

export const LoadingProvider = ({
  children,
  setIsLoading,
}: { children: React.ReactNode; setIsLoading: (loading: boolean) => void }) => {
  return <LoadingContext.Provider value={{ setIsLoading }}>{children}</LoadingContext.Provider>
}

interface FilterState {
  subgrupo: string
  marca: string
  linea: string
  modelo: string
  posicion: string
  codigoBrk: string
  refFmsiOem: string
}

interface FilterOptions {
  subgrupos: string[]
  marcas: string[]
  lineas: string[]
  modelos: string[]
  posiciones: string[]
  codigosBrk: string[]
  refsFmsiOem: string[]
}

const initialFilterState: FilterState = {
  subgrupo: "all_subgrupos",
  marca: "all_marcas",
  linea: "all_lineas",
  modelo: "all_modelos",
  posicion: "all_posiciones",
  codigoBrk: "all_codigos_brk",
  refFmsiOem: "all_refs_fmsi_oem",
}

export default function ProductFilters() {
  const [filters, setFilters] = useState<FilterState>(initialFilterState)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    subgrupos: [],
    marcas: [],
    lineas: [],
    modelos: [],
    posiciones: [],
    codigosBrk: [],
    refsFmsiOem: [],
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setIsLoading } = useLoading()

  useEffect(() => {
    const currentFilters = {
      subgrupo: searchParams.get("subgrupo") || "all_subgrupos",
      marca: searchParams.get("marca") || "all_marcas",
      linea: searchParams.get("linea") || "all_lineas",
      modelo: searchParams.get("modelo") || "all_modelos",
      posicion: searchParams.get("posicion") || "all_posiciones",
      codigoBrk: searchParams.get("codigoBrk") || "all_codigos_brk",
      refFmsiOem: searchParams.get("refFmsiOem") || "all_refs_fmsi_oem",
    }
    setFilters(currentFilters)
    loadFilterOptions()
  }, [searchParams.toString()])

  const loadFilterOptions = async (currentFilters: FilterState = filters) => {
    try {
      // Para cada select, cargamos las opciones basadas solo en los filtros anteriores (no en el actual)
      
      // 1. Subgrupos: siempre todas las opciones
      const { data: allProducts } = await supabase
        .from("products")
        .select("subgrupo")
      const subgrupos = [...new Set(allProducts?.map((p) => p.subgrupo || "").filter((s) => s !== null && s !== undefined))].sort()

      // 2. Marcas: filtradas por subgrupo (si existe)
      let marcasQuery = supabase.from("products").select("marca")
      if (currentFilters.subgrupo && currentFilters.subgrupo !== "all_subgrupos") {
        marcasQuery = marcasQuery.eq("subgrupo", currentFilters.subgrupo)
      }
      const { data: marcasData } = await marcasQuery
      const marcas = [...new Set(marcasData?.map((p) => p.marca).filter(Boolean))].sort()

      // 3. Líneas: filtradas por subgrupo y marca (si existen)
      let lineasQuery = supabase.from("products").select("linea")
      if (currentFilters.subgrupo && currentFilters.subgrupo !== "all_subgrupos") {
        lineasQuery = lineasQuery.eq("subgrupo", currentFilters.subgrupo)
      }
      if (currentFilters.marca && currentFilters.marca !== "all_marcas") {
        lineasQuery = lineasQuery.eq("marca", currentFilters.marca)
      }
      const { data: lineasData } = await lineasQuery
      const lineas = [...new Set(lineasData?.map((p) => p.linea).filter(Boolean))].sort()

      // 4. Modelos: filtradas por subgrupo, marca y línea (si existen)
      let modelosQuery = supabase.from("products").select("modelo")
      if (currentFilters.subgrupo && currentFilters.subgrupo !== "all_subgrupos") {
        modelosQuery = modelosQuery.eq("subgrupo", currentFilters.subgrupo)
      }
      if (currentFilters.marca && currentFilters.marca !== "all_marcas") {
        modelosQuery = modelosQuery.eq("marca", currentFilters.marca)
      }
      if (currentFilters.linea && currentFilters.linea !== "all_lineas") {
        modelosQuery = modelosQuery.eq("linea", currentFilters.linea)
      }
      const { data: modelosData } = await modelosQuery
      const modelos = [...new Set(modelosData?.map((p) => p.modelo).filter(Boolean))].sort()

      // 5. Posiciones: filtradas por subgrupo, marca, línea y modelo (si existen)
      let posicionesQuery = supabase.from("products").select("posicion")
      if (currentFilters.subgrupo && currentFilters.subgrupo !== "all_subgrupos") {
        posicionesQuery = posicionesQuery.eq("subgrupo", currentFilters.subgrupo)
      }
      if (currentFilters.marca && currentFilters.marca !== "all_marcas") {
        posicionesQuery = posicionesQuery.eq("marca", currentFilters.marca)
      }
      if (currentFilters.linea && currentFilters.linea !== "all_lineas") {
        posicionesQuery = posicionesQuery.eq("linea", currentFilters.linea)
      }
      if (currentFilters.modelo && currentFilters.modelo !== "all_modelos") {
        posicionesQuery = posicionesQuery.eq("modelo", currentFilters.modelo)
      }
      const { data: posicionesData } = await posicionesQuery
      const posiciones = [...new Set(posicionesData?.map((p) => p.posicion).filter(Boolean))].sort()

      // 6. Códigos BRK y Referencias: todos
      const { data: codigosData } = await supabase.from("products").select("codigo_brk, ref_fmsi_oem")
      const codigosBrk = [...new Set(codigosData?.map((p) => p.codigo_brk).filter(Boolean))].sort()
      const refsFmsiOem = [...new Set(codigosData?.map((p) => p.ref_fmsi_oem).filter(Boolean))].sort()

      const options: FilterOptions = {
        subgrupos,
        marcas,
        lineas,
        modelos,
        posiciones,
        codigosBrk,
        refsFmsiOem,
      }
      
      setFilterOptions(options)
    } catch (error) {
      console.error("Error loading filter options:", error)
    } finally {
      // Hide loading after fetching options
      setIsLoading(false)
    }
  }

  const handleFilterChange = (filterName: keyof FilterState, value: string) => {
    setIsLoading(true)

    const newFilters = { ...filters, [filterName]: value }

    // Reset dependent filters when a parent filter changes
    if (filterName === "subgrupo") {
      newFilters.marca = "all_marcas"
      newFilters.linea = "all_lineas"
      newFilters.modelo = "all_modelos"
      newFilters.posicion = "all_posiciones"
    } else if (filterName === "marca") {
      newFilters.linea = "all_lineas"
      newFilters.modelo = "all_modelos"
      newFilters.posicion = "all_posiciones"
    } else if (filterName === "linea") {
      newFilters.modelo = "all_modelos"
      newFilters.posicion = "all_posiciones"
    } else if (filterName === "modelo") {
      newFilters.posicion = "all_posiciones"
    }

    setFilters(newFilters)

    const params = new URLSearchParams(searchParams.toString())

    params.delete("page")

    // Update URL parameters
    Object.keys(newFilters).forEach((key) => {
      const filterKey = key as keyof FilterState
      const filterValue = newFilters[filterKey]
      if (filterValue && !filterValue.startsWith("all_")) {
        params.set(filterKey, filterValue)
      } else {
        params.delete(filterKey)
      }
    })

    const resultsSection = document.getElementById("results-section")
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth" })
    }

    router.push(`/?${params.toString()}`)

    // Reload filter options with new filters to show only relevant options
    loadFilterOptions(newFilters)
  }

  const handleClearFilters = () => {
    setIsLoading(true)

    setFilters(initialFilterState)
    const params = new URLSearchParams(searchParams.toString())

    const query = params.get("q")
    params.clear()
    if (query) {
      params.set("q", query)
    }

    const resultsSection = document.getElementById("results-section")
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth" })
    }

    router.push(`/?${params.toString()}`)

    // Reload filter options without any filters to show all available options
    loadFilterOptions(initialFilterState)
  }

  const filterFieldsRow1 = [
    {
      id: "subgrupo",
      label: "SUBGRUPO",
      value: filters.subgrupo,
      placeholder: "Seleccione subgrupo",
      options: [
        { value: "all_subgrupos", label: "Todas" },
        ...filterOptions.subgrupos.map((item) => ({ value: item, label: item })),
      ],
    },
    {
      id: "marca",
      label: "MARCA",
      value: filters.marca,
      placeholder: "Seleccione marca",
      options: [
        { value: "all_marcas", label: "Todas" },
        ...filterOptions.marcas.map((item) => ({ value: item, label: item })),
      ],
    },
    {
      id: "linea",
      label: "LÍNEA",
      value: filters.linea,
      placeholder: "Seleccione línea",
      options: [
        { value: "all_lineas", label: "Todas" },
        ...filterOptions.lineas.map((item) => ({ value: item, label: item })),
      ],
    },
    {
      id: "modelo",
      label: "MODELO",
      value: filters.modelo,
      placeholder: "Seleccione modelo",
      options: [
        { value: "all_modelos", label: "Todas" },
        ...filterOptions.modelos.map((item) => ({ value: item, label: item })),
      ],
    },
    {
      id: "posicion",
      label: "POSICIÓN",
      value: filters.posicion,
      placeholder: "Seleccione posición",
      options: [
        { value: "all_posiciones", label: "Todas" },
        ...filterOptions.posiciones.map((item) => ({ value: item, label: item })),
      ],
    },
  ] as const

  const filterFieldsRow2 = [
    {
      id: "codigoBrk",
      label: "CÓDIGOBRK",
      value: filters.codigoBrk,
      placeholder: "Seleccione código BRK",
      options: [
        { value: "all_codigos_brk", label: "Todas" },
        ...filterOptions.codigosBrk.map((item) => ({ value: item, label: item })),
      ],
    },
    {
      id: "refFmsiOem",
      label: "REF FMSI / OEM",
      value: filters.refFmsiOem,
      placeholder: "Seleccione REF FMSI/OEM",
      options: [
        { value: "all_refs_fmsi_oem", label: "Todas" },
        ...filterOptions.refsFmsiOem.map((item) => ({ value: item, label: item })),
      ],
    },
  ] as const

  return (
    <div className="p-6 bg-card rounded-lg shadow-lg border border-border space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-6">
        {filterFieldsRow1.map((field) => (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-xs font-medium text-muted-foreground">
              {field.label}
            </Label>
            <Select
              value={field.value}
              onValueChange={(value) => handleFilterChange(field.id as keyof FilterState, value)}
            >
              <SelectTrigger id={field.id} className="w-full text-sm bg-input border-border focus:border-primary h-9">
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-x-4 gap-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 flex-grow gap-x-4 gap-y-6">
          {filterFieldsRow2.map((field) => (
            <div key={field.id} className="space-y-1">
              <Label htmlFor={field.id} className="text-xs font-medium text-muted-foreground">
                {field.label}
              </Label>
              <Select
                value={field.value}
                onValueChange={(value) => handleFilterChange(field.id as keyof FilterState, value)}
              >
                <SelectTrigger id={field.id} className="w-full text-sm bg-input border-border focus:border-primary h-9">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="md:ml-auto md:pt-[21px]">
          <Button
            variant="outline"
            className="w-full md:w-auto text-sm border-green-500 text-green-500 hover:bg-green-500 hover:text-white h-9 px-4 bg-transparent"
            onClick={handleClearFilters}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Borrar Filtros
          </Button>
        </div>
      </div>
    </div>
  )
}
