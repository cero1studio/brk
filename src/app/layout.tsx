import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter, Space_Grotesk } from "next/font/google"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
import { Toaster } from "../components/ui/toaster"
import { cn } from "../lib/utils"
import { ThemeProvider } from "../contexts/ThemeContext"
import CatalogAuthWrapper from "../components/CatalogAuthWrapper"
import BrkWatermark from "../components/layout/BrkWatermark"

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
  icons: {
    icon: '/favicon.ico?v=4',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Log para verificar que el favicon se está configurando
  console.log('🔍 Favicon configurado automáticamente por Next.js')
  
  return (
    <html lang="es" className={cn(inter.variable, spaceGrotesk.variable)}>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link rel="icon" href="/favicon.ico?v=4" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico?v=4" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=4" />
        <meta name="msapplication-TileImage" content="/favicon.ico?v=4" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <ThemeProvider>
          <CatalogAuthWrapper>
            <BrkWatermark />
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
          </CatalogAuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
