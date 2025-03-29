"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { AD_CONFIG } from "@/lib/ad-config"

interface GoogleAdProps {
  slot: string
  format?: "auto" | "rectangle" | "horizontal" | "vertical"
  responsive?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function GoogleAd({
  slot,
  format = "auto",
  responsive = true,
  className = "",
  style = {},
}: GoogleAdProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const [isAdLoaded, setIsAdLoaded] = useState(false)

  useEffect(() => {
    // This would normally load the ad when the component mounts
    // In a real implementation, this would use the global 'adsbygoogle' object
    try {
      // @ts-ignore - In a real implementation, window.adsbygoogle would be available
      if (window.adsbygoogle && adRef.current) {
        // @ts-ignore
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})

        // In a real implementation, you would have a callback or event listener
        // to determine when the ad is actually loaded
        // For now, we'll simulate this with a timeout
        if (AD_CONFIG.googleAdsLoaded) {
          setIsAdLoaded(true)
        }
      }
    } catch (error) {
      console.error("Error loading Google ad:", error)
    }
  }, [slot])

  // If Google Ads are not loaded according to our config, don't render anything
  if (!AD_CONFIG.googleAdsLoaded) {
    return null
  }

  return (
    <div className={`google-ad ${className}`} style={style}>
      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Advertisement</div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center", ...style }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your actual AdSense publisher ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  )
}

