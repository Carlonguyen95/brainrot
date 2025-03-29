"use client"

import { useState, useEffect } from "react"
import { getUserMedia, deleteMedia } from "@/lib/actions/media-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Image, FileVideo, FileAudio, File } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MediaGalleryProps {
  userId?: string
  limit?: number
  onSelect?: (url: string) => void
  selectable?: boolean
}

export default function MediaGallery({ userId, limit = 20, onSelect, selectable = false }: MediaGalleryProps) {
  const [media, setMedia] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadMedia()
  }, [userId, page])

  const loadMedia = async () => {
    setIsLoading(true)
    try {
      const offset = page * limit
      const { items, totalCount } = await getUserMedia(userId, limit, offset)
      setMedia(items)
      setTotalCount(totalCount)
    } catch (error) {
      console.error("Error loading media:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const result = await deleteMedia(deleteId)
      if (result.success) {
        // Refresh the media list
        loadMedia()
      } else {
        alert(result.error || "Failed to delete media")
      }
    } catch (error) {
      console.error("Error deleting media:", error)
      alert("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const getMediaIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-6 w-6" />
    if (type.startsWith("video/")) return <FileVideo className="h-6 w-6" />
    if (type.startsWith("audio/")) return <FileAudio className="h-6 w-6" />
    return <File className="h-6 w-6" />
  }

  const renderMediaItem = (item: any) => {
    return (
      <Card key={item.id} className="overflow-hidden">
        <CardContent className="p-0 relative">
          {item.type.startsWith("image/") ? (
            <div
              className={`aspect-square relative ${selectable ? "cursor-pointer" : ""}`}
              onClick={() => selectable && onSelect && onSelect(item.url)}
            >
              <img src={item.url || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className={`aspect-square bg-gray-100 flex flex-col items-center justify-center p-4 ${selectable ? "cursor-pointer" : ""}`}
              onClick={() => selectable && onSelect && onSelect(item.url)}
            >
              {getMediaIcon(item.type)}
              <p className="mt-2 text-xs text-center truncate w-full">{item.name}</p>
            </div>
          )}

          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
            onClick={() => setDeleteId(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading media...</p>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No media found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map(renderMediaItem)}
          </div>

          {totalCount > limit && (
            <div className="flex justify-between items-center mt-6">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page + 1} of {Math.ceil(totalCount / limit)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * limit >= totalCount}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this media file. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

