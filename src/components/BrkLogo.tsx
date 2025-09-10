import Image from "next/image"

interface BrkLogoProps {
  className?: string
}

export default function BrkLogo({ className = "" }: BrkLogoProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Logo para modo claro */}
      <Image
        src="/brk-logo-black.webp"
        alt="BRK Performance Brakes"
        width={200}
        height={60}
        className="block dark:hidden"
        style={{
          width: "auto",
          height: "auto",
          maxHeight: "100%",
        }}
      />
      {/* Logo para modo oscuro */}
      <Image
        src="/brk-logo-white.webp"
        alt="BRK Performance Brakes"
        width={200}
        height={60}
        className="hidden dark:block"
        style={{
          width: "auto",
          height: "auto",
          maxHeight: "100%",
        }}
      />
    </div>
  )
}
