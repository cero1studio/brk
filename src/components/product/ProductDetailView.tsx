"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Info, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

// This function helps generate a more specific AI hint for images.
function generateImageHint(productName: string): string {
  return (
    productName
      .toLowerCase()
      .split(" ")
      .slice(0, 2)
      .join(" ")
      .replace(/[^a-z0-9\\s]/gi, "") || "vehicle part"
  )
}

const SpecItem = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (!value && value !== 0) return null
  return (
    <div className="flex flex-col rounded-lg bg-muted/50 p-3">
      <span className="text-xs text-muted-foreground capitalize">{label.replace(/_/g, " ")}</span>
      <span className="text-base font-semibold text-foreground">{String(value)}</span>
    </div>
  )
}

// This is the Client Component that handles state and interactions
export default function ProductDetailView({ product }: { product: Product }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [`/placeholder.svg?height=600&width=600&text=${encodeURIComponent(product.name)}`]

  const selectedImage = productImages[currentIndex]
  const imageHint = generateImageHint(product.name)
  const { specifications: spec } = product
  const hasMultipleImages = productImages.length > 1

  const handleNextImage = () => {
    if (hasMultipleImages) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % productImages.length)
    }
  }

  const handlePrevImage = () => {
    if (hasMultipleImages) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + productImages.length) % productImages.length)
    }
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Button
        variant="outline"
        asChild
        className="mb-8 group border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
      >
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4 group-hover:text-primary-foreground" />
          Volver al Catálogo
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Main info and Applications */}
        <div className="lg:col-span-3 space-y-8">
          <Card className="overflow-hidden shadow-2xl bg-card border border-border">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image Gallery */}
              <div className="p-4 md:p-6 bg-card-foreground/[.03]">
                <div className="space-y-4">
                  <div className="aspect-square relative group rounded-lg overflow-hidden border border-border">
                    <Image
                      src={selectedImage || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                      data-ai-hint={imageHint}
                    />
                    {hasMultipleImages && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-black/30 text-white hover:bg-black/50 hover:text-white transition-opacity"
                          aria-label="Imagen anterior"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-black/30 text-white hover:bg-black/50 hover:text-white transition-opacity"
                          aria-label="Siguiente imagen"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                      </>
                    )}
                  </div>
                  {hasMultipleImages && (
                    <div className="grid grid-cols-5 gap-2">
                      {productImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => handleThumbnailClick(index)}
                          className={cn(
                            "aspect-square relative rounded overflow-hidden border-2 transition-all",
                            currentIndex === index ? "border-primary" : "border-transparent hover:border-primary/50",
                          )}
                        >
                          <Image
                            src={img || "/placeholder.svg"}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="10vw"
                            data-ai-hint={imageHint}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 md:p-8 flex flex-col">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-3xl md:text-4xl font-headline text-primary mb-1">{product.name}</CardTitle>
                  <CardDescription className="text-md text-muted-foreground">
                    Categoría: <span className="text-foreground/90">{product.category}</span> | Proveedor:{" "}
                    <span className="text-foreground/90">{product.vendor}</span>
                  </CardDescription>
                </CardHeader>
                <div className="mt-4 mb-6">
                  <p className="text-3xl md:text-4xl font-semibold text-accent font-headline">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
                </div>

                <p className="font-body text-base text-foreground/90 mb-6 leading-relaxed">{product.description}</p>

                <div className="mt-auto pt-8">
                  <div className="flex flex-col">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full text-base border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                    >
                      <Info className="mr-2 h-5 w-5" /> Solicitar Información
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {product.aplicaciones && product.aplicaciones.length > 0 && (
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary">
                  Referencia de Vehículos Compatibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serie</TableHead>
                      <TableHead>Litros</TableHead>
                      <TableHead>Año</TableHead>
                      <TableHead>Especificación Vehículo</TableHead>
                      <TableHead>Eje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.aplicaciones.map((app, index) => (
                      <TableRow
                        key={index}
                        className={app.isHighlighted ? "bg-primary/20 hover:bg-primary/30" : "hover:bg-muted/50"}
                      >
                        <TableCell className="font-medium">{app.serie}</TableCell>
                        <TableCell>{app.litros || "N/A"}</TableCell>
                        <TableCell>{app.ano || "N/A"}</TableCell>
                        <TableCell>{app.especificacionVehiculo}</TableCell>
                        <TableCell>{app.eje || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Specifications */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl sticky top-28">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">Especificaciones Detalladas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <SpecItem label="Subgrupo" value={spec.subgrupo} />
                <SpecItem label="Código BRK" value={spec.codigoBrk} />
                <SpecItem label="Posición" value={spec.posicion} />
                <SpecItem label="REF FMSI / OEM" value={spec.refFmsiOem} />
                <SpecItem label="Marca" value={spec.marca} />
                <SpecItem label="Línea" value={spec.linea} />
                <SpecItem label="Modelo" value={spec.modelo} />
                <SpecItem label="Versión" value={spec.version} />
                <SpecItem label="Largo (mm)" value={spec.largo_mm} />
                <SpecItem label="Ancho (mm)" value={spec.ancho_mm} />
                <SpecItem label="Espesor (mm)" value={spec.espesor_mm} />
                <SpecItem label="Piezas por Juego" value={spec.xJuegoPastilla} />
                <SpecItem label="Diámetro (A) mm" value={spec.diametro_A_mm} />
                <SpecItem label="Alto (B) mm" value={spec.alto_B_mm} />
                <SpecItem label="Espesor (C) mm" value={spec.espesor_C_mm} />
                <SpecItem label="Espesor Mínimo (mm)" value={spec.espesor_min_mm} />
                <SpecItem label="Agujeros" value={spec.agujeros} />
                <SpecItem label="Diámetro Interno (A) mm" value={spec.diametro_interno_A_mm} />
                <SpecItem label="Orificio Central (C) mm" value={spec.diametro_orificio_central_C_mm} />
                <SpecItem label="Altura Total (D) mm" value={spec.altura_total_D_mm} />
                <SpecItem label="Diámetro Interno Máximo" value={spec.diametro_interno_maximo} />
                <SpecItem label="Equivalencias" value={spec.equivalencias} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
