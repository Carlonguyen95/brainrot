"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { searchSlangTerms, searchTags } from "@/lib/search"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Tag, X } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

type SearchSuggestionsProps = {
  className?: string
}

export default function SearchSuggestions({ className = "" }: SearchSuggestionsProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [wordResults, setWordResults] = useState<string[]>([])
  const [tagResults, setTagResults] = useState<string[]>([])
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchSuggestions() {
      if (debouncedQuery.length < 2) {
        setWordResults([])
        setTagResults([])
        return
      }

      setIsLoading(true)

      try {
        // Fetch word suggestions
        const results = await searchSlangTerms(debouncedQuery)
        const uniqueWords = Array.from(new Set(results.map((r) => r.word)))
        setWordResults(uniqueWords.slice(0, 5))

        // Fetch tag suggestions
        const tags = await searchTags(debouncedQuery)
        setTagResults(tags.slice(0, 3))
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim().length > 0) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
    }
  }

  function handleInputFocus() {
    if (query.trim().length >= 2) {
      setIsOpen(true)
    }
  }

  function handleSuggestionClick(suggestion: string, type: "word" | "tag") {
    if (type === "word") {
      router.push(`/define/${suggestion}`)
    } else {
      router.push(`/tag/${suggestion}`)
    }
    setIsOpen(false)
    setQuery("")
  }

  const hasSuggestions = wordResults.length > 0 || tagResults.length > 0

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="search"
          placeholder="Search slang or tags..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (e.target.value.length >= 2) {
              setIsOpen(true)
            } else {
              setIsOpen(false)
            }
          }}
          onFocus={handleInputFocus}
          className="pr-20"
        />

        {query && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-8 top-0 h-full"
            onClick={() => {
              setQuery("")
              setIsOpen(false)
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear</span>
          </Button>
        )}

        <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full px-3">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </form>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading suggestions...</div>
          ) : hasSuggestions ? (
            <div className="py-2">
              {wordResults.length > 0 && (
                <div className="px-3 py-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Words</h3>
                  <ul className="mt-1">
                    {wordResults.map((word) => (
                      <li key={word}>
                        <button
                          type="button"
                          className="flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                          onClick={() => handleSuggestionClick(word, "word")}
                        >
                          <Search className="h-4 w-4 mr-2 text-gray-400" />
                          {word}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tagResults.length > 0 && (
                <div className="px-3 py-1 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</h3>
                  <ul className="mt-1">
                    {tagResults.map((tag) => (
                      <li key={tag}>
                        <button
                          type="button"
                          className="flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                          onClick={() => handleSuggestionClick(tag, "tag")}
                        >
                          <Tag className="h-4 w-4 mr-2 text-gray-400" />
                          {tag}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="px-3 py-2 border-t border-gray-100">
                <button
                  type="button"
                  className="flex w-full items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                  onClick={handleSubmit}
                >
                  Search for "{query}"
                </button>
              </div>
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-sm text-gray-500">No suggestions found for "{query}"</div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">Type at least 2 characters to see suggestions</div>
          )}
        </div>
      )}
    </div>
  )
}

