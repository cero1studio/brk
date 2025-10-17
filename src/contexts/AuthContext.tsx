"use client"

import type { ReactNode } from "react"
import { createContext, useState, useEffect, useCallback, useContext } from "react"
import { usePathname, useRouter } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicializar con el valor del localStorage si está disponible
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem("autopart_admin_auth")
        return storedAuth === "true"
      } catch (error) {
        return false
      }
    }
    return false
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedAuth = localStorage.getItem("autopart_admin_auth")
        console.log('🔍 AuthContext: Checking stored auth:', storedAuth)
        const shouldBeAuthenticated = storedAuth === "true"
        
        if (shouldBeAuthenticated !== isAuthenticated) {
          console.log('🔄 AuthContext: Updating auth state from', isAuthenticated, 'to', shouldBeAuthenticated)
          setIsAuthenticated(shouldBeAuthenticated)
        }
      } catch (error) {
        console.error("No se pudo acceder a localStorage para verificar el estado de autenticación:", error)
      }
      setIsLoading(false)
    }

    // Solo verificar si hay cambios, no sobrescribir el estado inicial
    const storedAuth = localStorage.getItem("autopart_admin_auth")
    if (storedAuth === "true" && !isAuthenticated) {
      console.log('🔄 AuthContext: Restoring auth state from localStorage')
      setIsAuthenticated(true)
    }

    setIsLoading(false)

    // Escuchar cambios en localStorage
    window.addEventListener('storage', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
    }
  }, [isAuthenticated])

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    console.log('🔐 AuthContext: Login attempt with username:', username)
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call

    const validUsername = process.env.NEXT_PUBLIC_ADMIN_USER || "adminbrk"
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASS || "Brkadmin2025#"

    console.log('🔐 AuthContext: Valid credentials - username:', validUsername, 'password:', validPassword ? '***' : 'undefined')

    if (username === validUsername && password === validPassword) {
      console.log('✅ AuthContext: Login successful')
      setIsAuthenticated(true)
      try {
        localStorage.setItem("autopart_admin_auth", "true")
        console.log('💾 AuthContext: Auth state saved to localStorage')
        // Disparar evento para notificar al header
        window.dispatchEvent(new CustomEvent('adminLogin'))
      } catch (error) {
        console.error("No se pudo acceder a localStorage para establecer el estado de autenticación:", error)
      }
      setIsLoading(false)
      return true
    }
    console.log('❌ AuthContext: Login failed - invalid credentials')
    setIsAuthenticated(false)
    setIsLoading(false)
    return false
  }, [])

  const logout = useCallback(() => {
    console.log('🚪 AuthContext: Admin logout - removing autopart_admin_auth only')
    setIsAuthenticated(false)
    try {
      localStorage.removeItem("autopart_admin_auth")
      console.log('✅ AuthContext: Admin auth removed from localStorage')
      // Disparar evento para notificar al header
      window.dispatchEvent(new CustomEvent('adminLogout'))
      // Verificar que el catálogo no se vea afectado
      const catalogAuth = localStorage.getItem("brk_catalog_authenticated")
      console.log('🔍 AuthContext: Catalog auth status after admin logout:', catalogAuth)
    } catch (error) {
      console.error("No se pudo acceder a localStorage para eliminar el estado de autenticación:", error)
    }
    // Redirect to login page after logout if currently in a protected admin route
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [router, pathname])

  return <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
