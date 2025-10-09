"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useCatalogAuth } from "@/contexts/CatalogAuthContext"

export default function CatalogLogoutButton() {
  const { isAuthenticated, logout } = useCatalogAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <Button
      variant="outline"
      onClick={logout}
      className="text-base border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white bg-transparent"
    >
      <LogOut className="mr-2 h-5 w-5" /> Cerrar Sesión
    </Button>
  )
}
