export default function Footer() {
  return (
    <footer className="bg-card shadow-inner py-8 mt-auto">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} BRK Performance Brakes. Todos los derechos reservados.
        </p>
        <p className="text-xs mt-1">Diseñado para un Rendimiento y Seguridad de Vanguardia</p>
      </div>
    </footer>
  )
}
