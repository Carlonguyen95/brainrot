"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"

export default function RefreshButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    // Add a timestamp to force a refresh
    router.push(`/random?t=${Date.now()}`)
    router.refresh()
  }

  return (
    <Button
      onClick={handleRefresh}
      className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
      disabled={isLoading}
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "Loading..." : "New Random Definitions"}
    </Button>
  )
}

