import type { HTMLProps } from "react"
import Image from "next/image"

export function BrkLogo(props: HTMLProps<HTMLDivElement>) {
  return (
    <div {...props} className={`relative ${props.className || ""}`}>
      <Image
        src="/brk-logo-black.webp"
        alt="BRK Performance Brakes"
        width={200}
        height={60}
        className="block dark:hidden"
        priority
      />
      <Image
        src="/brk-logo-white.webp"
        alt="BRK Performance Brakes"
        width={200}
        height={60}
        className="hidden dark:block"
        priority
      />
    </div>
  )
}
