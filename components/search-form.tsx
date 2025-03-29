"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SearchFormProps = {
  initialQuery?: string
  className?: string
  variant?: "default" | "minimal"
  placeholder?: string
  showRandomButton?: boolean
}

export default function SearchForm({
  initialQuery = "",
  className = "",
  variant = "default",
  placeholder = "Search",
  showRandomButton = false,
}: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Update the input value if initialQuery changes
    setQuery(initialQuery)
  }, [initialQuery])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim().length > 0) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  function handleRandomClick() {
    router.push("/random")
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-12 py-3 rounded-full border-gray-200 focus:border-purple-500 focus:ring-purple-500"
        />
        {showRandomButton && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full text-gray-500 hover:text-purple-600 hover:bg-purple-100"
            onClick={handleRandomClick}
            title="Random Word"
          >
            <Shuffle className="h-5 w-5" />
            <span className="sr-only">Random Word</span>
          </Button>
        )}
      </div>
    </form>
  )
}

