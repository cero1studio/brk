export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a BRK</h1>
        <p className="text-lg mb-8">Encontrarás repuestos para automóviles y motocicletas</p>
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <form onSubmit={(e) => {
            e.preventDefault()
            const password = e.target.password.value
            if (password === "brk2025") {
              alert("¡Contraseña correcta! Aquí se mostraría el catálogo.")
            } else {
              alert("Contraseña incorrecta")
            }
          }}>
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
  )
}