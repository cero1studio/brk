import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-destructive">Producto no encontrado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">El producto que buscas no existe o ha sido eliminado.</p>
          <Button asChild>
            <Link href="/">Volver al catálogo</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
