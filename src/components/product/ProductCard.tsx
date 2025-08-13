"use client"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// Button is not used directly for navigation here anymore.

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageHint =
    product.name
      .toLowerCase()
      .split(" ")
      .slice(0, 2)
      .join(" ")
      .replace(/[^a-z0-9\\s]/gi, "") || "vehicle part"

  return (
    <Link
      href={`/products/${product.id}`}
      className="block group w-full mb-6"
      aria-label={`Ver detalles para ${product.name}`}
    >
      <Card className="w-full shadow-lg group-hover:shadow-primary/20 transition-all duration-300 bg-card rounded-lg border border-border group-hover:border-primary/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Image Section - No longer a separate Link */}
            <div className="w-full md:w-1/6 flex-shrink-0 flex flex-col items-center">
              <div className="aspect-square relative bg-muted rounded overflow-hidden border border-border w-full">
                <Image
                  src={product.images[0] || "https://placehold.co/150x150.png"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                  sizes="(max-width: 768px) 30vw, 15vw"
                  data-ai-hint={imageHint}
                />
              </div>
            </div>

            {/* Info Section (Ref, Equivalencias, Medidas) */}
            <div className="w-full md:w-2/6 flex-shrink-0 space-y-2 md:border-r md:border-border md:pr-4">
              {product.specifications.ref_brk && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">Ref.</span>
                  <p className="text-sm text-foreground font-medium">{product.specifications.ref_brk}</p>
                </div>
              )}
              {product.specifications.refFmsiOem && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">Equivalencias</span>
                  <p className="text-sm text-foreground">{product.specifications.refFmsiOem}</p>
                </div>
              )}
              {(product.specifications.largo_mm ||
                product.specifications.ancho_mm ||
                product.specifications.espesor_mm ||
                product.specifications.diametro_A_mm ||
                product.specifications.alto_B_mm) && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">Medidas</span>
                  <ul className="text-sm text-foreground list-none pl-0">
                    {product.specifications.largo_mm && <li>Largo: {product.specifications.largo_mm}mm</li>}
                    {product.specifications.ancho_mm && <li>Ancho: {product.specifications.ancho_mm}mm</li>}
                    {product.specifications.espesor_mm && <li>Espesor: {product.specifications.espesor_mm}mm</li>}
                    {product.specifications.diametro_A_mm && (
                      <li>Diámetro: {product.specifications.diametro_A_mm}mm</li>
                    )}
                    {product.specifications.alto_B_mm && <li>Alto: {product.specifications.alto_B_mm}mm</li>}
                  </ul>
                </div>
              )}
            </div>

            {/* Aplicaciones Section */}
            <div className="w-full md:w-3/6 flex-grow">
              <span className="text-xs font-semibold text-muted-foreground mb-1 block">Aplicaciones</span>
              {product.aplicaciones && product.aplicaciones.length > 0 ? (
                <div className="space-y-1">
                  {product.aplicaciones.map((app, index) => (
                    <div key={index} className="text-sm text-foreground">
                      {app.especificacionVehiculo} {app.ano}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic mt-2">No hay aplicaciones disponibles.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
