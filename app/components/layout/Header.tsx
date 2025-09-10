"use client"

import Link from "next/link"
import { useTheme } from "../../src/contexts/ThemeContext"
import { BrkLogo } from "../BrkLogo"

export default function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <BrkLogo
            style={{
              width: "auto",
              height: "auto",
              maxHeight: "100%",
            }}
          />
        </Link>
      </div>
    </header>
  )
}
