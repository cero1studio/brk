"use client"

import type { ReactNode } from "react"
import { createContext, useState, useEffect, useCallback, useContext } from "react"

interface CatalogAuthContextType {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
  isLoading: boolean
}

const CatalogAuthContext = createContext<CatalogAuthContextType | undefined>(undefined)

export const CatalogAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  
  console.log("CatalogAuthProvider renderizado - isAuthenticated:", isAuthenticated)

  // Contraseña hardcodeada para usuarios del catálogo
  const CATALOG_PASSWORD = "catalogo2025"

  useEffect(() => {
    // SIEMPRE empezar como no autenticado
    console.log("Iniciando como usuario no autenticado")
    setIsAuthenticated(false)
    setIsLoading(false)
  }, [])

  const login = useCallback((password: string): boolean => {
    if (password === CATALOG_PASSWORD) {
      setIsAuthenticated(true)
      try {
        localStorage.setItem("brk_catalog_auth", "true")
      } catch (error) {
        console.error("No se pudo acceder a localStorage para establecer el estado de autenticación del catálogo:", error)
      }
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    try {
      localStorage.removeItem("brk_catalog_auth")
    } catch (error) {
      console.error("No se pudo acceder a localStorage para eliminar el estado de autenticación del catálogo:", error)
    }
  }, [])

  return (
    <CatalogAuthContext.Provider 
      value={{ isAuthenticated, login, logout, isLoading }}
    >
      {children}
    </CatalogAuthContext.Provider>
  )
}

export const useCatalogAuth = (): CatalogAuthContextType => {
  const context = useContext(CatalogAuthContext)
  if (context === undefined) {
    throw new Error("useCatalogAuth must be used within a CatalogAuthProvider")
  }
  return context
}
