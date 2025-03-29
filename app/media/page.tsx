"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import Header from "@/components/header"
import MediaUpload from "@/components/media-upload"
import MediaGallery from "@/components/media-gallery"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MediaPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    router.push("/auth/login")
    return null
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container max-w-screen-xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Media Library</h1>

        <Tabs defaultValue="gallery">
          <TabsList className="mb-6">
            <TabsTrigger value="gallery">My Media</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery">
            {selectedUrl && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Selected Media URL:</p>
                <div className="flex items-center gap-2">
                  <input type="text" value={selectedUrl} readOnly className="flex-1 p-2 text-sm border rounded" />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedUrl)
                      alert("URL copied to clipboard!")
                    }}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => setSelectedUrl(null)}
                    className="px-3 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <MediaGallery onSelect={(url) => setSelectedUrl(url)} selectable={true} />
          </TabsContent>

          <TabsContent value="upload">
            <div className="max-w-md mx-auto">
              <MediaUpload
                onUploadComplete={(url) => {
                  setSelectedUrl(url)
                  // Switch to gallery tab after upload
                  document.querySelector('[data-state="inactive"][value="gallery"]')?.click()
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

