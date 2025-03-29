"use client"

import { useState, useRef } from "react"
import { X } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

export default function CatSticky() {
  const [isVisible, setIsVisible] = useState(true)
  const elementRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  // Using the provided cat GIF URL
  const catGifUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cat-wow-6hhc2IhqMynVpyHC7RbBkjAlLD8bfY.gif"

  if (!isVisible) {
    return null
  }

  return (
    <div
      ref={elementRef}
      className={`
      ${isMobile ? "fixed bottom-0 left-0 right-0 z-50" : "sticky top-[calc(4rem+16rem+1rem)]"}
    `}
    >
      <div
        className={`
        relative overflow-hidden bg-white rounded-lg shadow-md
        ${isMobile ? "w-full aspect-video" : "w-full"}
      `}
      >
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70 transition-colors"
          aria-label="Close cat sticky"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Cat GIF */}
        <div className="w-full">
          <img src={catGifUrl || "/placeholder.svg"} alt="Cat wow reaction" className="w-full h-auto" />
        </div>
      </div>
    </div>
  )
}

