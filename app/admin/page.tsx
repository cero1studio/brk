"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

// This component relies on localStorage check which is client-side.
// It doesn't use AuthContext to avoid re-render issues if context is not yet available
// during the initial fast redirect. AuthContext will handle protection for protected routes.
export default function AdminRootPage() {
  const router = useRouter()

  useEffect(() => {
    let isAuthenticated = false
    try {
      // Check localStorage directly for a quick redirect.
      // AuthContext will enforce security within protected routes.
      isAuthenticated = localStorage.getItem("autopart_admin_auth") === "true"
    } catch (e) {
      console.error("No se pudo acceder a localStorage para la redirección inicial:", e)
    }

    if (isAuthenticated) {
      router.replace("/admin/dashboard")
    } else {
      router.replace("/admin/login")
    }
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-foreground text-lg">Cargando Área de Administración...</p>
    </div>
  )
}
