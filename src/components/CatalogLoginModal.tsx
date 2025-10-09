"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Lock, LogOut } from "lucide-react"
import BrkLogo from "@/components/BrkLogo"

interface CatalogLoginModalProps {
  onLogin: (password: string) => boolean
  isOpen: boolean
  onLogout?: () => void
  showLogout?: boolean
}

export default function CatalogLoginModal({ onLogin, isOpen, onLogout, showLogout }: CatalogLoginModalProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simular un pequeño delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 500))

    const isValid = onLogin(password)
    
    if (!isValid) {
      setError("Contraseña incorrecta. Por favor, inténtelo de nuevo.")
      setPassword("")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <BrkLogo className="h-16 w-auto" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              Bienvenido a BRK
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Encontrarás una amplia gama de repuestos para automóviles y motocicletas, 
              especializados en sistemas de frenado de alto rendimiento. Nuestro catálogo 
              incluye campanas, cilindros, discos, pastas y sensores de la más alta calidad.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña de acceso
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese la contraseña"
                  className="pr-10"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-500 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {error}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !password.trim()}
              >
                {isLoading ? "Verificando..." : "Acceder al Catálogo"}
              </Button>
              {showLogout && onLogout && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={onLogout}
                  className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
