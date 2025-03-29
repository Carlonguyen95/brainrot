"use server"

import { createServerClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type MediaItem = {
  id: string
  name: string
  url: string
  type: string
  size: number
  created_at: string
  user_id: string
  username: string
}

// Upload a media file
export async function uploadMedia(
  file: File,
  bucket = "public",
): Promise<{ success: boolean; error?: string; url?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "You must be logged in to upload media" }
    }

    if (!file || file.size === 0) {
      return { success: false, error: "No file provided" }
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size exceeds 10MB limit" }
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "audio/mpeg",
      "audio/wav",
    ]

    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "File type not supported" }
    }

    const supabase = createServerClient()

    // Generate a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName)

    // Record the upload in the media table
    await supabase.from("media").insert({
      name: file.name,
      url: publicUrl,
      type: file.type,
      size: file.size,
      user_id: user.id,
    })

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error("Error in uploadMedia:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get media items by user
export async function getUserMedia(
  userId?: string,
  limit = 20,
  offset = 0,
): Promise<{ items: MediaItem[]; totalCount: number }> {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { items: [], totalCount: 0 }
    }

    // If no userId is provided, use the current user's ID
    const targetUserId = userId || currentUser.id

    // Check if the current user is requesting someone else's media
    if (targetUserId !== currentUser.id) {
      // Check if current user is an admin
      const supabase = createServerClient()
      const { data: adminData } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", currentUser.id)
        .single()

      // If not an admin, they can only see their own media
      if (!adminData) {
        return { items: [], totalCount: 0 }
      }
    }

    const supabase = createServerClient()

    // Get total count
    const { count } = await supabase.from("media").select("id", { count: "exact" }).eq("user_id", targetUserId)

    // Get media items
    const { data, error } = await supabase
      .from("media")
      .select(`
        *,
        users!inner (
          username
        )
      `)
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching media:", error)
      return { items: [], totalCount: 0 }
    }

    // Transform the data
    const items = data.map((item) => ({
      ...item,
      username: item.users.username,
    }))

    return { items, totalCount: count || 0 }
  } catch (error) {
    console.error("Error in getUserMedia:", error)
    return { items: [], totalCount: 0 }
  }
}

// Delete a media item
export async function deleteMedia(mediaId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "You must be logged in to delete media" }
    }

    const supabase = createServerClient()

    // Get the media item
    const { data: mediaItem } = await supabase.from("media").select("user_id, url").eq("id", mediaId).single()

    if (!mediaItem) {
      return { success: false, error: "Media item not found" }
    }

    // Check if user owns this media or is an admin
    if (mediaItem.user_id !== user.id) {
      // Check if user is an admin
      const { data: adminData } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).single()

      if (!adminData) {
        return { success: false, error: "You can only delete your own media" }
      }
    }

    // Extract the file path from the URL
    const url = new URL(mediaItem.url)
    const filePath = url.pathname.split("/").pop()

    if (!filePath) {
      return { success: false, error: "Invalid file path" }
    }

    // Delete the file from storage
    const { error: storageError } = await supabase.storage.from("public").remove([filePath])

    if (storageError) {
      console.error("Error deleting file from storage:", storageError)
      // Continue anyway to delete the database record
    }

    // Delete the media record
    const { error: dbError } = await supabase.from("media").delete().eq("id", mediaId)

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    revalidatePath("/media")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteMedia:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

