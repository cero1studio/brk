"use client"

import Link from "next/link"
import { Button } from "../ui/button"
import { UserCircle, Sun, Moon } from "lucide-react"
import { useTheme } from "../../contexts/ThemeContext"
import { BrkLogo } from "../BrkLogo"

export default function Header() {
  const { theme, toggleTheme } = useTheme()

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
            <Link href="/admin">
              <UserCircle className="mr-2 h-5 w-5" /> Portal Admin
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </nav>
      </div>
    </header>
  )
}
