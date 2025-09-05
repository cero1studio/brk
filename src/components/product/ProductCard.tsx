"use client"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

  const getVisibleColumns = () => {
    if (!product.aplicaciones || product.aplicaciones.length === 0) return []

    const hasModelo = product.aplicaciones.some((app) => app.serie && app.serie.trim() !== "")
    const hasAno = product.aplicaciones.some((app) => app.ano && app.ano.trim() !== "")
    const hasPosicion = product.aplicaciones.some((app) => app.eje && app.eje.trim() !== "")

    return {
      hasModelo,
      hasAno,
      hasPosicion,
    }
  }

  const parseVehicleSpec = (especificacionVehiculo: string) => {
    const parts = especificacionVehiculo.trim().split(" ")
    const marca = parts[0] || ""
    const linea = parts[1] || ""
    return { marca, linea }
  }

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
              {(product.specifications.codigoBrk || product.specifications.ref_brk) && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">Código BRK</span>
                  <p className="text-sm text-foreground font-medium">
                    {product.specifications.codigoBrk || product.specifications.ref_brk}
                  </p>
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

            <div className="w-full md:w-3/6 flex-grow">
              <span className="text-xs font-semibold text-muted-foreground mb-2 block">Aplicaciones</span>
              {product.aplicaciones && product.aplicaciones.length > 0 ? (
                (() => {
                  const visibleColumns = getVisibleColumns()
                  return (
                    <div className="border border-border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs font-semibold text-muted-foreground h-8 px-2">
                              Marca
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground h-8 px-2">
                              Línea
                            </TableHead>
                            {visibleColumns.hasModelo && (
                              <TableHead className="text-xs font-semibold text-muted-foreground h-8 px-2">
                                Modelo
                              </TableHead>
                            )}
                            {visibleColumns.hasAno && (
                              <TableHead className="text-xs font-semibold text-muted-foreground h-8 px-2">
                                Año
                              </TableHead>
                            )}
                            {visibleColumns.hasPosicion && (
                              <TableHead className="text-xs font-semibold text-muted-foreground h-8 px-2">
                                Posición
                              </TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {product.aplicaciones.map((app, index) => {
                            const { marca, linea } = parseVehicleSpec(app.especificacionVehiculo)
                            return (
                              <TableRow key={index} className="border-b border-border/50">
                                <TableCell className="text-xs text-foreground py-2 px-2">{marca}</TableCell>
                                <TableCell className="text-xs text-foreground py-2 px-2">{linea}</TableCell>
                                {visibleColumns.hasModelo && (
                                  <TableCell className="text-xs text-foreground py-2 px-2">
                                    {app.serie || "—"}
                                  </TableCell>
                                )}
                                {visibleColumns.hasAno && (
                                  <TableCell className="text-xs text-foreground py-2 px-2">{app.ano || "—"}</TableCell>
                                )}
                                {visibleColumns.hasPosicion && (
                                  <TableCell className="text-xs text-foreground py-2 px-2">{app.eje || "—"}</TableCell>
                                )}
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )
                })()
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
