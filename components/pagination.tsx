"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // If we have 5 or fewer pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always include the current page
      pageNumbers.push(currentPage)

      // Add pages before the current page
      for (let i = 1; i <= 2; i++) {
        if (currentPage - i > 0) {
          pageNumbers.unshift(currentPage - i)
        }
      }

      // Add pages after the current page
      for (let i = 1; i <= 2; i++) {
        if (currentPage + i <= totalPages) {
          pageNumbers.push(currentPage + i)
        }
      }

      // If we have less than maxPagesToShow, add more pages
      while (pageNumbers.length < maxPagesToShow && pageNumbers[0] > 1) {
        pageNumbers.unshift(pageNumbers[0] - 1)
      }

      while (pageNumbers.length < maxPagesToShow && pageNumbers[pageNumbers.length - 1] < totalPages) {
        pageNumbers.push(pageNumbers[pageNumbers.length - 1] + 1)
      }
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex flex-wrap justify-center items-center gap-2">
      {/* First page */}
      <Link href={`${baseUrl}?page=1`} passHref>
        <Button variant="outline" size="sm" disabled={currentPage === 1} className="hidden sm:flex">
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First</span>
        </Button>
      </Link>

      {/* Previous page */}
      <Link href={`${baseUrl}?page=${Math.max(1, currentPage - 1)}`} passHref>
        <Button variant="outline" size="sm" disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>
      </Link>

      {/* Page numbers */}
      {pageNumbers.map((page) => (
        <Link key={page} href={`${baseUrl}?page=${page}`} passHref>
          <Button
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            className={currentPage === page ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            {page}
          </Button>
        </Link>
      ))}

      {/* Next page */}
      <Link href={`${baseUrl}?page=${Math.min(totalPages, currentPage + 1)}`} passHref>
        <Button variant="outline" size="sm" disabled={currentPage === totalPages}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </Button>
      </Link>

      {/* Last page */}
      <Link href={`${baseUrl}?page=${totalPages}`} passHref>
        <Button variant="outline" size="sm" disabled={currentPage === totalPages} className="hidden sm:flex">
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last</span>
        </Button>
      </Link>
    </div>
  )
}

