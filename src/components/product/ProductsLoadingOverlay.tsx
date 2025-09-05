import { Loader2 } from "lucide-react"

export default function ProductsLoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card rounded-lg shadow-lg border border-border p-8 flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando resultados...</p>
      </div>
    </div>
  )
}
