"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const currentQuery = searchParams.get("q") || ""
    setQuery(currentQuery)
  }, [searchParams.get("q")])

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (query.trim()) {
      params.set("q", query.trim())
    } else {
      params.delete("q")
    }

    router.push(`/?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="flex gap-2 w-full max-w-2xl mx-auto">
      <Input
        type="text"
        placeholder="Buscar por producto, SKU, aplicación, equivalencia..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1"
      />
      <Button onClick={handleSearch} className="bg-red-600 hover:bg-red-700 text-white px-6">
        <Search className="mr-2 h-4 w-4" />
        Buscar
      </Button>
    </div>
  )
}
