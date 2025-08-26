export default function BrkWatermark() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="150" height="45">
            <rect width="200" height="60" fill="transparent" />
            <rect x="75" y="5" width="10" height="5" fill="#009246" />
            <rect x="85" y="5" width="10" height="5" fill="#FFFFFF" />
            <rect x="95" y="5" width="10" height="5" fill="#CE2B37" />
            <text x="50%" y="38" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="white" textAnchor="middle" letterSpacing="-1">BRK</text>
            <text x="50%" y="52" fontFamily="Arial, sans-serif" fontSize="7" fill="white" textAnchor="middle" letterSpacing="0.5">PERFORMANCE BRAKES</text>
          </svg>
        `)}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "200px 100px",
        opacity: "0.03",
        transform: "rotate(-15deg)",
        transformOrigin: "center",
      }}
    />
  )
}
