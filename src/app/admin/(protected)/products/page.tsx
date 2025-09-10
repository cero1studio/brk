"use client"
import { Button } from "@/components/ui/button"
import type React from "react"
import { Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { PlusCircle, Edit3, Trash2, Search, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import AdminProductFilters from "@/components/product/AdminProductFilters"
import ProductsPagination from "@/components/product/ProductsPagination"
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
  subgrupo: z.string().nullable().optional(),
  posicion: z.string().nullable().optional(),
  ref_fmsi_oem: z.string().nullable().optional(),
  marca: z.string().nullable().optional(),
  linea: z.string().nullable().optional(),
  modelo: z.string().nullable().optional(),
  version: z.string().nullable().optional(),
  largo_mm: z.coerce.string().nullable().optional(),
  ancho_mm: z.coerce.string().nullable().optional(),
  espesor_mm: z.coerce.string().nullable().optional(),
  x_juego_pastilla: z.coerce.number().nullable().optional(),
  diametro_a_mm: z.coerce.string().nullable().optional(),
  alto_b_mm: z.coerce.string().nullable().optional(),
  espesor_c_mm: z.coerce.string().nullable().optional(),
  espesor_min_mm: z.coerce.string().nullable().optional(),
  agujeros: z.coerce.number().nullable().optional(),
  diametro_interno_a_mm: z.coerce.string().nullable().optional(),
  diametro_orificio_central_c_mm: z.coerce.string().nullable().optional(),
  altura_total_d_mm: z.coerce.string().nullable().optional(),
  diametro_interno_maximo: z.coerce.string().nullable().optional(),
  equivalencias: z.string().nullable().optional(),
  price: z.coerce.number().nullable().optional(),
  stock: z.coerce.number().nullable().optional(),
  description: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalCount] = useState(0)
  const [filters, setFilters] = useState({
    subgrupo: "",
    marca: "",
  })
  const { toast } = useToast()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      codigo_brk: "",
      name: "",
      subgrupo: null,
      posicion: null,
      ref_fmsi_oem: null,
      marca: null,
      linea: null,
      modelo: null,
      version: null,
      largo_mm: null,
      ancho_mm: null,
      espesor_mm: null,
      x_juego_pastilla: 0,
      diametro_a_mm: null,
      alto_b_mm: null,
      espesor_c_mm: null,
      espesor_min_mm: null,
      agujeros: 0,
      diametro_interno_a_mm: null,
      diametro_orificio_central_c_mm: null,
      altura_total_d_mm: null,
      diametro_interno_maximo: null,
      equivalencias: null,
      price: 0,
      stock: 0,
      description: null,
      images: [],
    },
  })

  // Add after the form setup
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageUploading, setImageUploading] = useState(false)

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size and type
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen es demasiado grande (máx. 5MB)",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive",
      })
      return
    }

    try {
      setImageUploading(true)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Generate unique filename
      const timestamp = Date.now()
      const fileName = `product_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("products").upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      })

      if (error) {
        throw error
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(fileName)

      setImageFile(file)

      // Update form with the new image URL
      form.setValue("images", [publicUrl])

      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      })
    } finally {
      setImageUploading(false)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
    form.setValue("images", [])
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)

      const itemsPerPage = 10
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to)

      // Aplicar búsqueda
      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,codigo_brk.ilike.%${searchTerm}%,marca.ilike.%${searchTerm}%,linea.ilike.%${searchTerm}%,modelo.ilike.%${searchTerm}%`,
        )
      }

      if (filters.subgrupo) {
        query = query.eq("subgrupo", filters.subgrupo)
      }
      if (filters.marca) {
        query = query.eq("marca", filters.marca)
      }

      console.log("Executing query...")
      const { data, error, count } = await query

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("Products fetched successfully:", { count, dataLength: data?.length })
      setProducts(data || [])
      setTotalCount(count || 0)
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
      setTotalCount(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: { subgrupo: string; marca: string }) => {
    const processedFilters = {
      subgrupo: newFilters.subgrupo === "all_subgrupos" ? "" : newFilters.subgrupo,
      marca: newFilters.marca === "all_marcas" ? "" : newFilters.marca,
    }
    setFilters(processedFilters)
    setCurrentPage(1) // Reset to first page when filters change
    // fetchProducts will be called by useEffect when filters change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchProducts()
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSearch = (query: string) => {
    setSearchTerm(query)
    setCurrentPage(1)
    fetchProducts()
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
      setImageFile(null)
      setImagePreview("")
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
      subgrupo: null,
      posicion: null,
      ref_fmsi_oem: null,
      marca: null,
      linea: null,
      modelo: null,
      version: null,
      largo_mm: null,
      ancho_mm: null,
      espesor_mm: null,
      x_juego_pastilla: 0,
      diametro_a_mm: null,
      alto_b_mm: null,
      espesor_c_mm: null,
      espesor_min_mm: null,
      agujeros: 0,
      diametro_interno_a_mm: null,
      diametro_orificio_central_c_mm: null,
      altura_total_d_mm: null,
      diametro_interno_maximo: null,
      equivalencias: null,
      price: 0,
      stock: 0,
      description: null,
      images: [],
    })
    setIsModalOpen(true)
  }

  useEffect(() => {
    fetchProducts()
  }, [currentPage, filters])

  // const filteredProducts = products.filter(...)

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
                                disabled={imageUploading}
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
                            disabled={imageUploading}
                          />
                          <label
                            htmlFor="image-upload"
                            className={`cursor-pointer ${imageUploading ? "opacity-50" : ""}`}
                          >
                            <div className="flex flex-col items-center">
                              {imageUploading ? (
                                <Loader2 className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
                              ) : (
                                <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
                              )}
                              <span className="text-sm font-medium">
                                {imageUploading ? "Subiendo..." : imagePreview ? "Cambiar Imagen" : "Subir Imagen"}
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

      <AdminProductFilters onFiltersChange={handleFiltersChange} isLoading={loading} />

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por código BRK, marca, línea, modelo..."
              className="pl-10 w-full md:w-1/2 lg:w-1/3 bg-input border-border focus:border-primary"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="relative">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando productos...</span>
            </div>
          ) : products.length > 0 ? (
            <>
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
                  {products.map((product) => (
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
                            className="text-gray-600 hover:text-gray-800"
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

              <div className="mt-6">
                <ProductsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalProducts}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              {searchTerm || Object.values(filters).some((f) => f) ? (
                <p className="text-muted-foreground">
                  No se encontraron productos que coincidan con los criterios de búsqueda.
                </p>
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
