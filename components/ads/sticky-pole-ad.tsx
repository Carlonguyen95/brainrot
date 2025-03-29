"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"
import GoogleAd from "./google-ad"
import { AD_CONFIG } from "@/lib/ad-config"

interface StickyPoleAdProps {
  useGoogleAds?: boolean
}

export default function StickyPoleAd({ useGoogleAds = false }: StickyPoleAdProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1280)
    }

    // Initial check
    checkScreenSize()

    // Add event listener
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  if (!isVisible || isSmallScreen) return null

  // If Google Ads are enabled but not loaded, don't show anything
  if (useGoogleAds && !AD_CONFIG.googleAdsLoaded) {
    return null
  }

  if (useGoogleAds) {
    return (
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30 w-[120px]">
        <div className="relative">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 z-10"
            aria-label="Close advertisement"
          >
            <X className="h-3 w-3" />
          </button>

          <GoogleAd
            slot="3456789012" // Replace with your actual ad slot ID
            format="vertical"
            responsive={false}
            style={{ width: "120px", height: "600px" }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30 w-[120px]">
      <div className="relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 z-10"
          aria-label="Close advertisement"
        >
          <X className="h-3 w-3" />
        </button>

        <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider text-center">Ad</div>

        <Link href="/store">
          <Card className="overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors">
            <div className="bg-gradient-to-b from-gray-100 to-white p-3 text-center">
              <div className="mb-2">
                <img
                  src="/placeholder.svg?height=100&width=100"
                  alt="Advertisement"
                  className="w-full h-auto rounded"
                />
              </div>
              <p className="text-xs font-medium text-gray-800 mb-2">Brain Rot Merch</p>
              <p className="text-xs text-gray-600 mb-2">Get your slang on a mug!</p>
              <button className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full w-full hover:bg-blue-600 transition-colors">
                Shop Now
              </button>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}

