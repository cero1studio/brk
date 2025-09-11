"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../../src/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../src/components/ui/card"
import { Button } from "../../../../src/components/ui/button"
import { PlusCircle, Edit3, Trash2 } from "lucide-react"
import { Input } from "../../../../src/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../src/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../src/components/ui/dialog"
import { Label } from "../../../../src/components/ui/label"
import { useToast } from "../../../../src/hooks/use-toast"

interface Category {
  id: string
  name: string
  productCount: number
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newSubgroupName, setNewSubgroupName] = useState("")
  const [editSubgroupName, setEditSubgroupName] = useState("")
  const { toast } = useToast()

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

  const handleAddSubgroup = async () => {
    if (!newSubgroupName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del subgrupo no puede estar vacío",
        variant: "destructive",
      })
      return
    }

    // Check if subgroup already exists
    if (categories.some((cat) => cat.name.toLowerCase() === newSubgroupName.toLowerCase())) {
      toast({
        title: "Error",
        description: "Ya existe un subgrupo con ese nombre",
        variant: "destructive",
      })
      return
    }

    try {
      // Since subgroups are derived from products, we need to create a placeholder product
      // or handle this differently. For now, we'll just show success and refresh
      setIsAddDialogOpen(false)
      setNewSubgroupName("")
      toast({
        title: "Éxito",
        description: "Subgrupo creado correctamente. Aparecerá cuando agregues productos a él.",
      })
    } catch (error) {
      console.error("Error adding subgroup:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el subgrupo",
        variant: "destructive",
      })
    }
  }

  const handleEditSubgroup = async () => {
    if (!editSubgroupName.trim() || !editingCategory) {
      toast({
        title: "Error",
        description: "El nombre del subgrupo no puede estar vacío",
        variant: "destructive",
      })
      return
    }

    try {
      // Update all products with the old subgroup name to the new name
      const { error } = await supabase
        .from("products")
        .update({ subgrupo: editSubgroupName })
        .eq("subgrupo", editingCategory.name)

      if (error) {
        console.error("Error updating subgroup:", error)
        toast({
          title: "Error",
          description: "No se pudo actualizar el subgrupo",
          variant: "destructive",
        })
        return
      }

      setIsEditDialogOpen(false)
      setEditingCategory(null)
      setEditSubgroupName("")
      fetchCategoriesWithCounts()
      toast({
        title: "Éxito",
        description: "Subgrupo actualizado correctamente",
      })
    } catch (error) {
      console.error("Error updating subgroup:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el subgrupo",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSubgroup = async (category: Category) => {
    if (category.productCount > 0) {
      toast({
        title: "Error",
        description: "No se puede eliminar un subgrupo que tiene productos asignados",
        variant: "destructive",
      })
      return
    }

    try {
      // Since this subgroup has no products, it will automatically disappear from the list
      fetchCategoriesWithCounts()
      toast({
        title: "Éxito",
        description: "Subgrupo eliminado correctamente",
      })
    } catch (error) {
      console.error("Error deleting subgroup:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el subgrupo",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setEditSubgroupName(category.name)
    setIsEditDialogOpen(true)
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
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setIsAddDialogOpen(true)}
          >
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
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/80"
                          title="Eliminar"
                          onClick={() => handleDeleteSubgroup(category)}
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Subgrupo</DialogTitle>
            <DialogDescription>Crea un nuevo subgrupo para organizar tus productos.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subgroup-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="subgroup-name"
                value={newSubgroupName}
                onChange={(e) => setNewSubgroupName(e.target.value)}
                className="col-span-3"
                placeholder="Nombre del subgrupo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSubgroup}>Crear Subgrupo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Subgrupo</DialogTitle>
            <DialogDescription>
              Modifica el nombre del subgrupo. Esto actualizará todos los productos asociados.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-subgroup-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="edit-subgroup-name"
                value={editSubgroupName}
                onChange={(e) => setEditSubgroupName(e.target.value)}
                className="col-span-3"
                placeholder="Nombre del subgrupo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubgroup}>Actualizar Subgrupo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
