"use client"

import Link from "next/link"
import { Button } from "../ui/button"
import { UserCircle, Sun, Moon, LogOut } from "lucide-react"
import { useTheme } from "../../contexts/ThemeContext"
import { BrkLogo } from "../BrkLogo"
import { useState, useEffect } from "react"

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const [isCatalogAuthenticated, setIsCatalogAuthenticated] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  // Verificar si el usuario está autenticado en el catálogo
  useEffect(() => {
    const checkCatalogAuth = () => {
      const auth = localStorage.getItem('brk_catalog_authenticated')
      const isAuth = auth === 'true'
      setIsCatalogAuthenticated(isAuth)
    }
    
    checkCatalogAuth()
    // Escuchar cambios en localStorage
    window.addEventListener('storage', checkCatalogAuth)
    // También escuchar los eventos personalizados de login y logout
    window.addEventListener('catalogLogin', checkCatalogAuth)
    window.addEventListener('catalogLogout', checkCatalogAuth)
    return () => {
      window.removeEventListener('storage', checkCatalogAuth)
      window.removeEventListener('catalogLogin', checkCatalogAuth)
      window.removeEventListener('catalogLogout', checkCatalogAuth)
    }
  }, [])

  // Verificar si el usuario está autenticado en el admin
  useEffect(() => {
    const checkAdminAuth = () => {
      const auth = localStorage.getItem('autopart_admin_auth')
      const isAuth = auth === 'true'
      console.log('🔍 Header: Checking admin auth:', auth, 'isAuth:', isAuth)
      setIsAdminAuthenticated(isAuth)
    }
    
    checkAdminAuth()
    // Escuchar cambios en localStorage
    window.addEventListener('storage', checkAdminAuth)
    // También escuchar eventos personalizados de login/logout del admin
    window.addEventListener('adminLogin', checkAdminAuth)
    window.addEventListener('adminLogout', checkAdminAuth)
    
    return () => {
      window.removeEventListener('storage', checkAdminAuth)
      window.removeEventListener('adminLogin', checkAdminAuth)
      window.removeEventListener('adminLogout', checkAdminAuth)
    }
  }, [])

  const handleCatalogLogout = () => {
    console.log('🚪 Header: Catalog logout initiated')
    localStorage.removeItem('brk_catalog_authenticated')
    setIsCatalogAuthenticated(false)
    // Disparar un evento personalizado para notificar a la página principal
    window.dispatchEvent(new CustomEvent('catalogLogout'))
    console.log('✅ Header: Catalog logout completed')
  }

  const handleAdminLogout = () => {
    console.log('🚪 Header: Admin logout initiated')
    localStorage.removeItem('autopart_admin_auth')
    setIsAdminAuthenticated(false)
    // Disparar evento para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('adminLogout'))
    // Redirigir al login del admin
    window.location.href = '/admin/login'
    console.log('✅ Header: Admin logout completed')
  }

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <BrkLogo className="h-10 w-auto" />
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" asChild className="text-base hidden sm:inline-flex">
            <Link href="/">Catálogo</Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="text-base border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
          >
            <Link href="/admin/login">
              <UserCircle className="mr-2 h-5 w-5" /> Portal Admin
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          {isCatalogAuthenticated && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCatalogLogout} 
              aria-label="Cerrar sesión del catálogo"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Cerrar sesión del catálogo"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
          {isAdminAuthenticated && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleAdminLogout} 
              aria-label="Cerrar sesión del admin"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Cerrar sesión del admin"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
