"use client"

import { CatalogAuthProvider } from "@/contexts/CatalogAuthContext"

interface CatalogAuthWrapperProps {
  children: React.ReactNode
}

export default function CatalogAuthWrapper({ children }: CatalogAuthWrapperProps) {
  return (
    <CatalogAuthProvider>
      {children}
    </CatalogAuthProvider>
  )
}
