"use client"

import { useEffect } from "react"
import { AD_CONFIG } from "@/lib/ad-config"

export default function GoogleAdSenseScript() {
  useEffect(() => {
    // Only add the script if Google Ads are enabled
    if (!AD_CONFIG.useGoogleAds) return

    // Only add the script once
    if (!document.getElementById("google-adsense-script")) {
      const script = document.createElement("script")
      script.id = "google-adsense-script"
      script.async = true
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" // Replace with your AdSense publisher ID
      script.crossOrigin = "anonymous"
      document.head.appendChild(script)
    }
  }, [])

  return null
}

