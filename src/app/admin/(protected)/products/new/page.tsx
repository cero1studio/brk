"use client"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, UploadCloud, Loader2, FileImage } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import type React from "react"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const productSchema = z.object({
  name: z.string().min(3, "El nombre del producto debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  price: z.coerce
    .number({ invalid_type_error: "El precio debe ser un número." })
    .min(0.01, "El precio debe ser positivo."),
  category: z.string().min(2, "La categoría es obligatoria."),
  vendor: z.string().min(2, "El proveedor es obligatorio."),
  stock: z.coerce
    .number({ invalid_type_error: "El stock debe ser un número." })
    .int()
    .min(0, "El stock no puede ser negativo."),
  sku: z.string().min(3, "El SKU es obligatorio."),
  images: z
    .array(
      z.object({
        file: z.any(), // We'll validate the file manually
        preview: z.string(),
      }),
    )
    .min(1, "Se requiere al menos una imagen.")
    .max(5, "Máximo 5 imágenes permitidas."),

  // Updated Specifications
  specifications: z.object({
    subgrupo: z.string().optional(),
    posicion: z.string().optional(),
    refFmsiOem: z.string().optional(),
    marca: z.string().optional(),
    linea: z.string().optional(),
    modelo: z.string().optional(),
    version: z.string().optional(),
    largo_mm: z.string().optional(),
    ancho_mm: z.string().optional(),
    espesor_mm: z.string().optional(),
    xJuegoPastilla: z.coerce.number().optional(),
    diametro_A_mm: z.string().optional(),
    alto_B_mm: z.string().optional(),
    espesor_C_mm: z.string().optional(),
    espesor_min_mm: z.string().optional(),
    agujeros: z.coerce.number().optional(),
    diametro_interno_A_mm: z.string().optional(),
    diametro_orificio_central_C_mm: z.string().optional(),
    altura_total_D_mm: z.string().optional(),
    diametro_interno_maximo: z.string().optional(),
    equivalencias: z.string().optional(),
  }),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function NewProductPage() {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      description: "",
      price: undefined,
      category: "",
      vendor: "",
      stock: undefined,
      sku: "",
      images: [],
      specifications: {},
    },
  })

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control: form.control,
    name: "images",
  })

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const currentImageCount = imageFields.length
    if (files.length + currentImageCount > 5) {
      form.setError("images", {
        type: "manual",
        message: "No puedes subir más de 5 imágenes en total.",
      })
      return
    }

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        form.setError(`images`, { message: `La imagen "${file.name}" es demasiado grande (máx 5MB).` })
        return
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        form.setError(`images`, { message: `Tipo de archivo no válido para "${file.name}".` })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        appendImage({ file, preview: reader.result as string })
      }
      reader.readAsDataURL(file)
    })
    // Clear file input
    event.target.value = ""
  }

  async function onSubmit(data: ProductFormValues) {
    const validation = productSchema.safeParse(data)
    if (!validation.success) {
      validation.error.errors.forEach((error) => {
        form.setError(error.path.join(".") as any, {
          type: "manual",
          message: error.message,
        })
      })
      return
    }

    // Simulate API call and form data creation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, you would handle file uploads to a storage service (like Firebase Storage)
    // and then save the URLs to your database.
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (key === "images") {
        data.images.forEach((image, index) => {
          formData.append(`image_${index}`, image.file)
        })
      } else if (key === "specifications") {
        formData.append("specifications", JSON.stringify(value))
      } else {
        formData.append(key, String(value))
      }
    })

    console.log("Datos del producto a enviar (simulado):", data)
    console.log("FormData listo para enviar (simulado):", formData)

    toast({
      title: "¡Producto Añadido!",
      description: `${data.name} ha sido añadido exitosamente. (Acción simulada)`,
      variant: "default",
    })
    form.reset()
    router.push("/admin/products") // Redirect to products list
  }

  return (
    <Card className="shadow-xl border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Añadir Nuevo Producto</CardTitle>
        <CardDescription>
          Complete los detalles para la nueva pieza de vehículo. Todos los campos son obligatorios a menos que se
          indique lo contrario.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <section className="space-y-4 p-4 border border-border rounded-lg bg-card/50">
              <h3 className="text-lg font-semibold font-headline text-primary">Información Básica</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Nombre del Producto</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., Filtro de Aire de Rendimiento"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>SKU / CÓDIGOBRK</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., PAF-12345"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Descripción Detallada</FormLabel>{" "}
                    <FormControl>
                      <Textarea
                        placeholder="Proporcione una descripción completa..."
                        {...field}
                        rows={5}
                        className="bg-input border-border focus:border-primary"
                      />
                    </FormControl>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Precio ($)</FormLabel>{" "}
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="ej., 49.99"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Cantidad en Stock</FormLabel>{" "}
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="ej., 100"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Categoría</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., Partes de Motor, Frenos"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Proveedor/Marca</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., AutoTech Pro"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <Separator className="bg-border" />

            <section className="space-y-4 p-4 border border-border rounded-lg bg-card/50">
              <h3 className="text-lg font-semibold font-headline text-primary">Imágenes del Producto</h3>
              <FormDescription>
                Sube hasta 5 imágenes desde tu ordenador. La primera imagen será la principal.
              </FormDescription>

              {imageFields.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imageFields.map((field, index) => (
                    <div key={field.id} className="relative aspect-square group">
                      <Image
                        src={field.preview || "/placeholder.svg"}
                        alt={`Vista previa de la imagen ${index + 1}`}
                        fill
                        className="object-cover rounded-md border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar Imagen</span>
                      </Button>
                      {index === 0 && (
                        <div className="absolute bottom-0 w-full text-center bg-black/50 text-white text-xs py-0.5 rounded-b-md">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <FormField
                control={form.control}
                name="images"
                render={() => (
                  <FormItem>
                    {imageFields.length < 5 && (
                      <FormControl>
                        <Label
                          htmlFor="file-upload"
                          className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <FileImage className="h-10 w-10 text-muted-foreground mb-2" />
                          <span className="text-primary font-semibold">Haz clic para subir imágenes</span>
                          <span className="text-muted-foreground text-sm">o arrastra y suelta aquí</span>
                          <span className="text-xs text-muted-foreground mt-2">PNG, JPG, WEBP (MÁX. 5MB cada uno)</span>
                          <Input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                            multiple
                            onChange={handleImageChange}
                            disabled={imageFields.length >= 5}
                          />
                        </Label>
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator className="bg-border" />

            <section className="space-y-6 p-4 border border-border rounded-lg bg-card/50">
              <h3 className="text-lg font-semibold font-headline text-primary">Especificaciones Detalladas</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="specifications.subgrupo"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Subgrupo</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="Pastas, Discos..."
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.posicion"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Posición</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="Delantera, Trasera"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.marca"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Marca</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="Ford, Chevrolet..."
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.linea"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Línea</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="Ceramic Pro"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.modelo"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Modelo</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="SUV Model T"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.version"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Versión</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="All Trims"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.refFmsiOem"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>REF FMSI / OEM</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="OEM 1234, Bendix D567"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.equivalencias"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Equivalencias</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="1542 / 10281"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
              </div>
              <Separator className="my-4 bg-border/50" />
              <h4 className="text-md font-semibold font-headline text-primary/90">Dimensiones de Pastillas de Freno</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="specifications.largo_mm"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Largo (mm)</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., 155"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.ancho_mm"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Ancho (mm)</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., 69.1"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.espesor_mm"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Espesor (mm)</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., 17.5"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.xJuegoPastilla"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel># Piezas x Juego</FormLabel>{" "}
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="ej., 4"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
              </div>
              <Separator className="my-4 bg-border/50" />
              <h4 className="text-md font-semibold font-headline text-primary/90">Dimensiones de Rotor y Tambor</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="specifications.diametro_A_mm"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Diámetro (A) mm</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., 320"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.alto_B_mm"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Alto (B) mm</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., 45"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.espesor_C_mm"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Espesor (C) mm</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., 28"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.espesor_min_mm"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Espesor Mín. (mm)</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., 26"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.agujeros"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Agujeros</FormLabel>{" "}
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="ej., 5"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.diametro_interno_A_mm"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Diámetro Interno (A) mm</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., 220"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.diametro_orificio_central_C_mm"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Orificio Central (C) mm</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., 68"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.altura_total_D_mm"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Altura Total (D) mm</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., 76"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications.diametro_interno_maximo"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Diám. Interno Máx.</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="ej., 221.5"
                          {...field}
                          className="bg-input border-border focus:border-primary"
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                size="lg"
                className="min-w-[150px] bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                {form.formState.isSubmitting ? "Enviando..." : "Añadir Producto"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
