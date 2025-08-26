import { BrkLogo } from "../BrkLogo"

export default function BrkWatermark() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.08,
          transform: "rotate(-15deg)",
          transformOrigin: "center",
          filter: "contrast(1.2)",
        }}
      >
        <div
          className="grid grid-cols-6 gap-20 w-full h-full"
          style={{
            transform: "scale(1.5)",
            transformOrigin: "center",
          }}
        >
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <BrkLogo className="w-32 h-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
