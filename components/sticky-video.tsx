"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

type StickyVideoProps = {
  videoType: "minecraft" | "subway"
}

export default function StickyVideo({ videoType = "minecraft" }: StickyVideoProps) {
  const [isVisible, setIsVisible] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isMobile = useMobile()

  // Video URLs
  const videoUrls = {
    minecraft: "/videos/minecraft-parkour.mp4",
    subway: "/videos/subway-surfers.mp4",
  }

  useEffect(() => {
    // Attempt to play the video when component mounts
    if (videoRef.current && isVisible) {
      videoRef.current.play().catch((error) => {
        console.log("Autoplay prevented:", error)
      })
    }
  }, [isVisible])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`
      ${isMobile ? "fixed bottom-0 left-0 right-0 z-50" : "sticky top-4"}
    `}
    >
      <div
        className={`
        relative overflow-hidden bg-black
        ${isMobile ? "w-full aspect-video" : "aspect-[9/16] rounded-lg shadow-md"}
      `}
      >
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70 transition-colors"
          aria-label="Close video"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close video</span>
        </button>

        {/* Video element */}
        <video
          ref={videoRef}
          src={videoUrls[videoType]}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          controls={false}
        />
      </div>
    </div>
  )
}

