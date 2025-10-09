"use client"

import { useState } from "react"

export default function HomePage() {
  const [showCatalog, setShowCatalog] = useState(false)

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const password = (e.target as HTMLFormElement).password.value
    if (password === "brk2025") {
      setShowCatalog(true)
    } else {
      alert("Contraseña incorrecta")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Formulario de Login */}
      <div className={`${showCatalog ? 'catalog-hidden' : 'catalog-visible'} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">Bienvenido a BRK</h1>
          <p className="text-lg mb-8 text-gray-300">Encontrarás repuestos para automóviles y motocicletas</p>
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <form onSubmit={handleLogin}>
              <input
                name="password"
                type="password"
                placeholder="Ingrese la contraseña"
                className="w-full p-3 border rounded mb-4"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
              >
                Acceder al Catálogo
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Contenido del Catálogo */}
      <div className={`${showCatalog ? 'catalog-visible' : 'catalog-hidden'}`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Catálogo BRK</h1>
            <button
              onClick={() => setShowCatalog(false)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cerrar Sesión
            </button>
          </div>
          
          <div className="text-white">
            <h2 className="text-2xl mb-4">Categorías disponibles:</h2>
            <ul className="space-y-2">
              <li>• Campanas</li>
              <li>• Cilindros</li>
              <li>• Discos</li>
              <li>• Pastas</li>
              <li>• Sensores</li>
            </ul>
            <p className="mt-6 text-gray-300">
              Aquí se mostraría el catálogo completo de productos BRK Performance Brakes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}