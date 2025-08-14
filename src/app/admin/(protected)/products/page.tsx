"use client"
import { Button } from "@/components/ui/button"
import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { PlusCircle, Edit3, Trash2, Search, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const productSchema = z.object({
  codigo_brk: z.string().min(1, "Código BRK es requerido"),
  name: z.string().min(1, "Nombre es requerido"),
  subgrupo: z.string().optional(),
  posicion: z.string().optional(),
  ref_fmsi_oem: z.string().optional(),
  marca: z.string().optional(),
  linea: z.string().optional(),
  modelo: z.string().optional(),
  version: z.string().optional(),
  largo_mm: z.string().optional(),
  ancho_mm: z.string().optional(),
  espesor_mm: z.string().optional(),
  x_juego_pastilla: z.coerce.number().optional(),
  diametro_a_mm: z.string().optional(),
  alto_b_mm: z.string().optional(),
  espesor_c_mm: z.string().optional(),
  espesor_min_mm: z.string().optional(),
  agujeros: z.coerce.number().optional(),
  diametro_interno_a_mm: z.string().optional(),
  diametro_orificio_central_c_mm: z.string().optional(),
  altura_total_d_mm: z.string().optional(),
  diametro_interno_maximo: z.string().optional(),
  equivalencias: z.string().optional(),
  price: z.coerce.number().optional(),
  stock: z.coerce.number().optional(),
  description: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const { toast } = useToast()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      codigo_brk: "",
      name: "",
      subgrupo: "",
      posicion: "",
      ref_fmsi_oem: "",
      marca: "",
      linea: "",
      modelo: "",
      version: "",
      largo_mm: "",
      ancho_mm: "",
      espesor_mm: "",
      x_juego_pastilla: 0,
      diametro_a_mm: "",
      alto_b_mm: "",
      espesor_c_mm: "",
      espesor_min_mm: "",
      agujeros: 0,
      diametro_interno_a_mm: "",
      diametro_orificio_central_c_mm: "",
      altura_total_d_mm: "",
      diametro_interno_maximo: "",
      equivalencias: "",
      price: 0,
      stock: 0,
      description: "",
    },
  })

  // Add after the form setup
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImageFile(file)
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching products:", error)
        return
      }

      setProducts(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente",
      })

      fetchProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase.from("products").update(data).eq("id", editingProduct.id)

        if (error) {
          toast({
            title: "Error",
            description: "No se pudo actualizar el producto",
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Producto actualizado",
          description: "El producto ha sido actualizado exitosamente",
        })
      } else {
        // Create new product
        const { error } = await supabase.from("products").insert([data])

        if (error) {
          toast({
            title: "Error",
            description: "No se pudo crear el producto",
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Producto creado",
          description: "El producto ha sido creado exitosamente",
        })
      }

      setIsModalOpen(false)
      setEditingProduct(null)
      form.reset()
      fetchProducts()
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el producto",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    form.reset({
      ...product,
      x_juego_pastilla: product.x_juego_pastilla || 0,
      agujeros: product.agujeros || 0,
      price: product.price || 0,
      stock: product.stock || 0,
    })

    // Load existing image
    if (product.images && product.images[0]) {
      setImagePreview(product.images[0])
      setImageFile(null)
    } else {
      setImagePreview("")
      setImageFile(null)
    }

    setIsModalOpen(true)
  }

  const handleNewProduct = () => {
    setEditingProduct(null)
    setImageFile(null)
    setImagePreview("")
    form.reset({
      codigo_brk: "",
      name: "",
      subgrupo: "",
      posicion: "",
      ref_fmsi_oem: "",
      marca: "",
      linea: "",
      modelo: "",
      version: "",
      largo_mm: "",
      ancho_mm: "",
      espesor_mm: "",
      x_juego_pastilla: 0,
      diametro_a_mm: "",
      alto_b_mm: "",
      espesor_c_mm: "",
      espesor_min_mm: "",
      agujeros: 0,
      diametro_interno_a_mm: "",
      diametro_orificio_central_c_mm: "",
      altura_total_d_mm: "",
      diametro_interno_maximo: "",
      equivalencias: "",
      price: 0,
      stock: 0,
      description: "",
    })
    setIsModalOpen(true)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo_brk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.linea?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.modelo?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline">Gestionar Productos</CardTitle>
            <CardDescription>Ver, añadir, editar o eliminar productos de tu catálogo.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchProducts} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewProduct} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <PlusCircle className="mr-2 h-5 w-5" /> Añadir Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Editar Producto" : "Añadir Nuevo Producto"}</DialogTitle>
                  <DialogDescription>
                    {editingProduct ? "Modifica los datos del producto" : "Completa los datos del nuevo producto"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="codigo_brk"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código BRK *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: BRK001"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nombre del producto"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subgrupo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subgrupo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: Pastillas de freno"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="posicion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posición</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: Delantero, Trasero"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ref_fmsi_oem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>REF FMSI/OEM</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Referencia FMSI/OEM"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="marca"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marca</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: Toyota, Ford"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="linea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Línea</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Línea del vehículo"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="modelo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Modelo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Modelo del vehículo"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="version"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Versión</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Versión del modelo"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="largo_mm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Largo (mm)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: 150.5"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ancho_mm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ancho (mm)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: 75.2"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="espesor_mm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Espesor (mm)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: 17.5"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="x_juego_pastilla"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>X Juego Pastilla</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Ej: 4"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : 0)}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="diametro_a_mm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diámetro A (mm)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: 280.0"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="alto_b_mm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alto B (mm)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: 45.0"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="espesor_c_mm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Espesor C (mm)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: 25.0"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="espesor_min_mm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Espesor Mín (mm)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: 2.0"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="agujeros"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agujeros</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Ej: 5"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : 0)}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="diametro_interno_a_mm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diámetro Interno A (mm)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: 60.0"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="diametro_orificio_central_c_mm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Orificio Central C (mm)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: 65.1"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="altura_total_d_mm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Altura Total D (mm)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: 32.0"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="diametro_interno_maximo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diámetro Interno Máximo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: 300.0"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="equivalencias"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equivalencias</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Códigos equivalentes"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Ej: 25.99"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : 0)}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Ej: 100"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : 0)}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descripción detallada del producto..."
                              rows={3}
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Imagen del Producto</label>
                        <p className="text-xs text-muted-foreground mb-2">Sube una imagen del producto</p>

                        {imagePreview && (
                          <div className="mb-4">
                            <div className="relative w-48 h-48 group">
                              <img
                                src={imagePreview || "/placeholder.svg"}
                                alt="Vista previa del producto"
                                className="w-full h-full object-cover rounded-md border border-border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={removeImage}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                          <input
                            type="file"
                            id="image-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                              <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
                              <span className="text-sm font-medium">
                                {imagePreview ? "Cambiar Imagen" : "Subir Imagen"}
                              </span>
                              <span className="text-xs text-muted-foreground">PNG, JPG, WEBP (máx. 5MB)</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Guardando..." : editingProduct ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por código BRK, marca, línea, modelo..."
              className="pl-10 w-full md:w-1/2 lg:w-1/3 bg-input border-border focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando productos...</span>
            </div>
          ) : filteredProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Imagen</TableHead>
                  <TableHead>Código BRK</TableHead>
                  <TableHead>Subgrupo</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Línea</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Image
                        src={product.images?.[0] || "/placeholder.svg?height=60&width=60&query=auto part"}
                        alt={product.name || "Producto"}
                        width={60}
                        height={60}
                        className="rounded-md object-cover aspect-square border border-border"
                      />
                    </TableCell>
                    <TableCell className="font-mono font-medium">{product.codigo_brk || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.subgrupo || "N/A"}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{product.marca || "N/A"}</TableCell>
                    <TableCell>{product.linea || "N/A"}</TableCell>
                    <TableCell>{product.modelo || "N/A"}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:text-primary/80"
                          title="Editar"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/80"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el producto "
                                {product.name}" de la base de datos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteProduct(product.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              {searchTerm ? (
                <p className="text-muted-foreground">No se encontraron productos que coincidan con "{searchTerm}".</p>
              ) : (
                <p className="text-muted-foreground">
                  No se encontraron productos. Empieza por añadir un nuevo producto o usar la carga masiva.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
