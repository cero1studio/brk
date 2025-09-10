"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { Loader2 } from "lucide-react"

export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/admin/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // This state should ideally be brief due to the redirect.
    // Returning null prevents rendering children before redirect.
    return null
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Optional: Admin-specific Header could go here if different from main site header */}
        <main className="flex-grow p-6 md:p-8 overflow-auto">{children}</main>
        {/* Optional: Admin-specific Footer */}
      </div>
    </div>
  )
}
