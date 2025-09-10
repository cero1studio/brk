import type { SVGProps } from "react"

export function BrkLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 60"
      width="150"
      height="45"
      aria-label="Logo de BRK Performance Brakes"
      {...props}
    >
      <rect width="200" height="60" fill="transparent" />
      {/* Italian Flag */}
      <rect x="75" y="5" width="10" height="5" fill="#009246" /> {/* Green */}
      <rect x="85" y="5" width="10" height="5" fill="#FFFFFF" /> {/* White */}
      <rect x="95" y="5" width="10" height="5" fill="#CE2B37" /> {/* Red */}
      {/* BRK Text */}
      <text
        x="50%"
        y="38"
        fontFamily="Arial, sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
        letterSpacing="-1"
      >
        BRK
      </text>
      {/* PERFORMANCE BRAKES Text */}
      <text
        x="50%"
        y="52"
        fontFamily="Arial, sans-serif"
        fontSize="7"
        fill="white"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        PERFORMANCE BRAKES
      </text>
    </svg>
  )
}
