"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AdminFilterState {
  subgrupo: string
  marca: string
}

interface AdminFilterOptions {
  subgrupos: string[]
  marcas: string[]
}

const initialFilterState: AdminFilterState = {
  subgrupo: "all_subgrupos",
  marca: "all_marcas",
}

interface AdminProductFiltersProps {
  onFiltersChange: (filters: AdminFilterState) => void
}

export default function AdminProductFilters({ onFiltersChange }: AdminProductFiltersProps) {
  const [filters, setFilters] = useState<AdminFilterState>(initialFilterState)
  const [filterOptions, setFilterOptions] = useState<AdminFilterOptions>({
    subgrupos: [],
    marcas: [],
  })

  useEffect(() => {
    loadFilterOptions()
  }, [])

  const loadFilterOptions = async (currentFilters: AdminFilterState = initialFilterState) => {
    try {
      let query = supabase.from("products").select("subgrupo, marca")

      // Apply progressive filtering based on current selections
      if (currentFilters.subgrupo && currentFilters.subgrupo !== "all_subgrupos") {
        query = query.eq("subgrupo", currentFilters.subgrupo)
      }

      const { data: products, error } = await query

      if (error) throw error

      if (products) {
        const options: AdminFilterOptions = {
          subgrupos: [...new Set(products.map((p) => p.subgrupo).filter((s) => s !== null && s !== undefined))],
          marcas: [...new Set(products.map((p) => p.marca).filter(Boolean))],
        }
        setFilterOptions(options)
      }
    } catch (error) {
      console.error("Error loading filter options:", error)
    }
  }

  const handleFilterChange = (filterName: keyof AdminFilterState, value: string) => {
    const newFilters = { ...filters, [filterName]: value }

    // Reset dependent filters when a parent filter changes
    if (filterName === "subgrupo") {
      newFilters.marca = "all_marcas"
    }

    setFilters(newFilters)
    onFiltersChange(newFilters)
    loadFilterOptions(newFilters)
  }

  const handleClearFilters = () => {
    setFilters(initialFilterState)
    onFiltersChange(initialFilterState)
    loadFilterOptions(initialFilterState)
  }

  const filterFields = [
    {
      id: "subgrupo",
      label: "CATEGORÍA",
      value: filters.subgrupo,
      placeholder: "Seleccione categoría",
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
  ] as const

  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 flex-grow gap-4">
          {filterFields.map((field) => (
            <div key={field.id} className="space-y-1">
              <Label htmlFor={field.id} className="text-xs font-medium text-muted-foreground">
                {field.label}
              </Label>
              <Select
                value={field.value}
                onValueChange={(value) => handleFilterChange(field.id as keyof AdminFilterState, value)}
              >
                <SelectTrigger id={field.id} className="w-full text-sm bg-input border-border h-9">
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

        <Button
          variant="outline"
          className="w-full md:w-auto text-sm border-gray-600 text-gray-300 hover:bg-gray-800 h-9 px-4 bg-transparent"
          onClick={handleClearFilters}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Borrar Filtros
        </Button>
      </div>
    </div>
  )
}
