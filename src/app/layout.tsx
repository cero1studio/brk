import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter, Space_Grotesk } from "next/font/google"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
import { Toaster } from "../components/ui/toaster"
import { cn } from "../lib/utils"
import { ThemeProvider } from "../contexts/ThemeContext"
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
    icon: '/favicon.png?v=2',
    shortcut: '/favicon.png?v=2',
    apple: '/favicon.png?v=2',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={cn(inter.variable, spaceGrotesk.variable)}>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png?v=2" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png?v=2" />
        <link rel="apple-touch-icon" href="/favicon.png?v=2" />
      </head>
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
