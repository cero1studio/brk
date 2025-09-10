"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit3, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Category {
  id: string
  name: string
  productCount: number
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchCategoriesWithCounts()
  }, [])

  const fetchCategoriesWithCounts = async () => {
    try {
      setLoading(true)

      // Get unique subgroups directly from products table
      const { data: products, error } = await supabase.from("products").select("subgrupo")

      if (error) {
        console.error("Error fetching products:", error)
        return
      }

      // Get unique subgroups and count products for each
      const subgroupCounts =
        products?.reduce((acc: Record<string, number>, product) => {
          const subgroup = product.subgrupo || "Sin Subgrupo"
          acc[subgroup] = (acc[subgroup] || 0) + 1
          return acc
        }, {}) || {}

      // Create categories array from actual subgroups in database
      const categoriesWithCounts = Object.entries(subgroupCounts).map(([subgroup, count], index) => ({
        id: (index + 1).toString(),
        name: subgroup,
        productCount: count as number,
      }))

      setCategories(categoriesWithCounts)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Cargando subgrupos...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline">Gestionar Subgrupos</CardTitle>
            <CardDescription>Gestiona los subgrupos de productos de frenos.</CardDescription>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5" /> Añadir Nuevo Subgrupo
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <Input
            placeholder="Buscar subgrupos..."
            className="w-full md:w-1/2 lg:w-1/3 bg-input border-border focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          {filteredCategories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subgrupo</TableHead>
                  <TableHead className="text-right">Productos</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-right font-semibold">{category.productCount}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:text-primary/80"
                          title="Editar"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/80"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No se encontraron subgrupos.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
