"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { useAuth } from "../../../src/contexts/AuthContext"
import { Button } from "../../../src/components/ui/button"
import { Input } from "../../../src/components/ui/input"
import { Label } from "../../../src/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../src/components/ui/card"
import { LogIn, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { BrkLogo } from "../../components/BrkLogo"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading: authLoading } = useAuth()
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    const success = await login(username, password)
    if (success) {
      router.push("/admin/dashboard")
    } else {
      setError("Credenciales inválidas. Por favor, inténtelo de nuevo.")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-card p-4">
      <Card className="w-full max-w-md shadow-2xl border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-fit">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <BrkLogo className="h-12" />
            </Link>
          </div>
          <CardTitle className="text-3xl font-headline text-primary">Portal de Administración</CardTitle>
          <CardDescription>
            Por favor, ingrese sus credenciales para acceder al panel de administración.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username_admin" className="text-base">
                Usuario
              </Label>
              <Input
                id="username_admin"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario"
                required
                className="text-base py-3 bg-input border-border focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_admin" className="text-base">
                Contraseña
              </Label>
              <Input
                id="password_admin"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
                className="text-base py-3 bg-input border-border focus:border-primary"
              />
            </div>
            {error && (
              <div className="flex items-center text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full text-base py-3 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting || authLoading}
            >
              {isSubmitting || authLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              {isSubmitting || authLoading ? "Verificando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center block">
          <Button variant="link" asChild className="mt-2 text-primary">
            <Link href="/">Volver al Sitio Principal</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
