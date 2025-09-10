"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Product } from "@/types"

interface ProductDetailViewProps {
  product: Product
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    if (product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  const currentImage =
    product.images.length > 0
      ? product.images[currentImageIndex]
      : `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(product.name)}`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative aspect-square">
                <Image
                  src={currentImage || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-contain rounded-lg"
                  priority
                />
                {product.images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-transparent"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                    index === currentImageIndex ? "border-primary" : "border-border"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.specifications.subgrupo && <Badge variant="secondary">{product.specifications.subgrupo}</Badge>}
              {product.specifications.marca && <Badge variant="outline">{product.specifications.marca}</Badge>}
              {product.specifications.posicion && <Badge variant="outline">{product.specifications.posicion}</Badge>}
            </div>
            <p className="text-muted-foreground text-lg">{product.description}</p>
          </div>

          <Separator />

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">SKU:</span>
                  <p className="text-muted-foreground">{product.sku}</p>
                </div>
                <div>
                  <span className="font-medium">Categoría:</span>
                  <p className="text-muted-foreground">{product.category}</p>
                </div>
                <div>
                  <span className="font-medium">Proveedor:</span>
                  <p className="text-muted-foreground">{product.vendor}</p>
                </div>
                <div>
                  <span className="font-medium">Stock:</span>
                  <p className="text-muted-foreground">{product.stock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Applications */}
          {product.aplicaciones && product.aplicaciones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Aplicaciones de Vehículos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {product.aplicaciones.map((app, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">{app.especificacionVehiculo}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        {app.serie && <span>Serie: {app.serie}</span>}
                        {app.litros && <span>Litros: {app.litros}</span>}
                        {app.ano && <span>Año: {app.ano}</span>}
                        {app.eje && <span>Eje: {app.eje}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Especificaciones Técnicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.refFmsiOem && (
                  <div>
                    <span className="font-medium">REF FMSI/OEM:</span>
                    <p className="text-muted-foreground">{product.specifications.refFmsiOem}</p>
                  </div>
                )}
                {product.specifications.codigoBrk && (
                  <div>
                    <span className="font-medium">Código BRK:</span>
                    <p className="text-muted-foreground">{product.specifications.codigoBrk}</p>
                  </div>
                )}
                {product.specifications.largo_mm && (
                  <div>
                    <span className="font-medium">Largo:</span>
                    <p className="text-muted-foreground">{product.specifications.largo_mm} mm</p>
                  </div>
                )}
                {product.specifications.ancho_mm && (
                  <div>
                    <span className="font-medium">Ancho:</span>
                    <p className="text-muted-foreground">{product.specifications.ancho_mm} mm</p>
                  </div>
                )}
                {product.specifications.espesor_mm && (
                  <div>
                    <span className="font-medium">Espesor:</span>
                    <p className="text-muted-foreground">{product.specifications.espesor_mm} mm</p>
                  </div>
                )}
                {product.specifications.diametro_A_mm && (
                  <div>
                    <span className="font-medium">Diámetro A:</span>
                    <p className="text-muted-foreground">{product.specifications.diametro_A_mm} mm</p>
                  </div>
                )}
                {product.specifications.alto_B_mm && (
                  <div>
                    <span className="font-medium">Alto B:</span>
                    <p className="text-muted-foreground">{product.specifications.alto_B_mm} mm</p>
                  </div>
                )}
                {product.specifications.espesor_C_mm && (
                  <div>
                    <span className="font-medium">Espesor C:</span>
                    <p className="text-muted-foreground">{product.specifications.espesor_C_mm} mm</p>
                  </div>
                )}
                {product.specifications.agujeros && (
                  <div>
                    <span className="font-medium">Agujeros:</span>
                    <p className="text-muted-foreground">{product.specifications.agujeros}</p>
                  </div>
                )}
                {product.specifications.xJuegoPastilla && (
                  <div>
                    <span className="font-medium">Por Juego:</span>
                    <p className="text-muted-foreground">{product.specifications.xJuegoPastilla} pastillas</p>
                  </div>
                )}
                {product.specifications.equivalencias && (
                  <div className="md:col-span-2">
                    <span className="font-medium">Equivalencias:</span>
                    <p className="text-muted-foreground">{product.specifications.equivalencias}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
