import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      {/* Loading skeleton for multiple product cards */}
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-card rounded-lg shadow-lg border border-border p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image skeleton */}
            <div className="lg:w-64 flex-shrink-0">
              <Skeleton className="w-full h-48 rounded-md" />
            </div>

            {/* Content skeleton */}
            <div className="flex-1 space-y-4">
              {/* Title and reference */}
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>

              {/* Specifications grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, specIndex) => (
                  <div key={specIndex} className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>

              {/* Applications section */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 5 }).map((_, headerIndex) => (
                      <Skeleton key={headerIndex} className="h-4 w-full" />
                    ))}
                  </div>
                  {Array.from({ length: 2 }).map((_, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 5 }).map((_, cellIndex) => (
                        <Skeleton key={cellIndex} className="h-4 w-full" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
