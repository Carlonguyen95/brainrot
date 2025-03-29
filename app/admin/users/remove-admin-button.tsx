"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { removeAdminUser } from "@/lib/actions/admin-actions"
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

interface RemoveAdminButtonProps {
  userId: string
  username: string
}

export default function RemoveAdminButton({ userId, username }: RemoveAdminButtonProps) {
  const [open, setOpen] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const router = useRouter()

  async function handleRemove() {
    setIsRemoving(true)

    try {
      const result = await removeAdminUser(userId)

      if (result.success) {
        setOpen(false)
        router.refresh()
      } else {
        console.error("Error removing admin user:", result.error)
        alert("Failed to remove admin user: " + result.error)
      }
    } catch (error) {
      console.error("Error in handleRemove:", error)
      alert("An unexpected error occurred")
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-red-500 hover:text-red-700">
        <Trash2 className="h-4 w-4 mr-1" />
        Remove
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will remove admin privileges from user "{username}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleRemove()
              }}
              disabled={isRemoving}
              className="bg-red-500 hover:bg-red-600"
            >
              {isRemoving ? "Removing..." : "Remove Admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

