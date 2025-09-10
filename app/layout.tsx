import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter, Space_Grotesk } from "next/font/google"
import Header from "../src/components/layout/Header"
import Footer from "../src/components/layout/Footer"
import { Toaster } from "../src/components/ui/toaster"
import { cn } from "../src/lib/utils"
import { ThemeProvider } from "../src/contexts/ThemeContext"
import BrkWatermark from "../src/components/layout/BrkWatermark"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "BRK Performance Brakes",
  description: "Su proveedor principal de soluciones de frenado de alto rendimiento.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={cn(inter.variable, spaceGrotesk.variable)}>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <ThemeProvider>
          <BrkWatermark />
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
