"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteCustomAd } from "@/lib/actions/custom-ad-actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
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

interface DeleteCustomAdButtonProps {
  id: number
  title: string
}

export default function DeleteCustomAdButton({ id, title }: DeleteCustomAdButtonProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setIsDeleting(true)

    try {
      const result = await deleteCustomAd(id)

      if (result.success) {
        setOpen(false)
        router.refresh()
      } else {
        console.error("Error deleting ad:", result.error)
        alert("Failed to delete ad: " + result.error)
      }
    } catch (error) {
      console.error("Error in handleDelete:", error)
      alert("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-red-500 hover:text-red-700">
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the ad "{title}". This action cannot be undone.
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
    </>
  )
}

