"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface ProductsPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void
}

export default function ProductsPagination({ currentPage, totalPages, onPageChange }: ProductsPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return

    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete("page")
    } else {
      params.set("page", page.toString())
    }

    // Scroll to top of results
    const resultsSection = document.getElementById("results-section")
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth" })
    }

    // Call optional callback for loading state
    onPageChange?.(page)

    router.push(`/?${params.toString()}`)
  }

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 4) {
        // Show pages 2-5 and ellipsis
        for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
          pages.push(i)
        }
        if (totalPages > 5) {
          pages.push("ellipsis")
        }
      } else if (currentPage >= totalPages - 3) {
        // Show ellipsis and last 4 pages
        pages.push("ellipsis")
        for (let i = Math.max(2, totalPages - 4); i <= totalPages - 1; i++) {
          pages.push(i)
        }
      } else {
        // Show ellipsis, current page area, ellipsis
        pages.push("ellipsis")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handlePageChange(currentPage - 1)}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-accent"}
          />
        </PaginationItem>

        {getPageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            {page === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => handlePageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer hover:bg-accent"
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => handlePageChange(currentPage + 1)}
            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-accent"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
