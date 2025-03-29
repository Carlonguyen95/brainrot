"use server"

import { createServerClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type Comment = {
  id: string
  definition_id: string
  user_id: string
  username: string
  avatar_url?: string
  content: string
  created_at: string
  updated_at: string
  likes: number
}

// Get comments for a definition
export async function getCommentsByDefinitionId(definitionId: string): Promise<Comment[]> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        users!inner (
          username,
          avatar_url
        )
      `)
      .eq("definition_id", definitionId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching comments:", error)
      return []
    }

    // Transform the data
    return data.map((comment) => ({
      ...comment,
      username: comment.users.username,
      avatar_url: comment.users.avatar_url,
    }))
  } catch (error) {
    console.error("Error in getCommentsByDefinitionId:", error)
    return []
  }
}

// Add a comment to a definition
export async function addComment(
  definitionId: string,
  content: string,
): Promise<{ success: boolean; error?: string; commentId?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "You must be logged in to comment" }
    }

    if (!content.trim()) {
      return { success: false, error: "Comment cannot be empty" }
    }

    const supabase = createServerClient()

    // Get the definition to check if it exists and for revalidation
    const { data: definition } = await supabase.from("definitions").select("word").eq("id", definitionId).single()

    if (!definition) {
      return { success: false, error: "Definition not found" }
    }

    // Add the comment
    const { data, error } = await supabase
      .from("comments")
      .insert({
        definition_id: definitionId,
        user_id: user.id,
        content: content.trim(),
      })
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/define/${definition.word}`)

    return { success: true, commentId: data.id }
  } catch (error) {
    console.error("Error in addComment:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Update a comment
export async function updateComment(commentId: string, content: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "You must be logged in to update a comment" }
    }

    if (!content.trim()) {
      return { success: false, error: "Comment cannot be empty" }
    }

    const supabase = createServerClient()

    // Check if user owns this comment
    const { data: comment } = await supabase
      .from("comments")
      .select("user_id, definition_id")
      .eq("id", commentId)
      .single()

    if (!comment) {
      return { success: false, error: "Comment not found" }
    }

    if (comment.user_id !== user.id) {
      return { success: false, error: "You can only edit your own comments" }
    }

    // Get the definition for revalidation
    const { data: definition } = await supabase
      .from("definitions")
      .select("word")
      .eq("id", comment.definition_id)
      .single()

    // Update the comment
    const { error } = await supabase
      .from("comments")
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)

    if (error) {
      return { success: false, error: error.message }
    }

    if (definition) {
      revalidatePath(`/define/${definition.word}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateComment:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Delete a comment
export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "You must be logged in to delete a comment" }
    }

    const supabase = createServerClient()

    // Check if user owns this comment or is an admin
    const { data: comment } = await supabase
      .from("comments")
      .select("user_id, definition_id")
      .eq("id", commentId)
      .single()

    if (!comment) {
      return { success: false, error: "Comment not found" }
    }

    // Check if user is an admin
    const { data: adminData } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).single()

    const isAdmin = !!adminData

    if (comment.user_id !== user.id && !isAdmin) {
      return { success: false, error: "You can only delete your own comments" }
    }

    // Get the definition for revalidation
    const { data: definition } = await supabase
      .from("definitions")
      .select("word")
      .eq("id", comment.definition_id)
      .single()

    // Delete the comment
    const { error } = await supabase.from("comments").delete().eq("id", commentId)

    if (error) {
      return { success: false, error: error.message }
    }

    if (definition) {
      revalidatePath(`/define/${definition.word}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteComment:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Like a comment
export async function likeComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "You must be logged in to like a comment" }
    }

    const supabase = createServerClient()

    // Check if comment exists and get definition for revalidation
    const { data: comment } = await supabase.from("comments").select("definition_id").eq("id", commentId).single()

    if (!comment) {
      return { success: false, error: "Comment not found" }
    }

    // Check if user already liked this comment
    const { data: existingLike } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .single()

    if (existingLike) {
      // Unlike the comment
      await supabase.from("comment_likes").delete().eq("id", existingLike.id)

      // Decrement the likes count
      await supabase
        .from("comments")
        .update({ likes: supabase.rpc("decrement", { x: 1 }) })
        .eq("id", commentId)
    } else {
      // Like the comment
      await supabase.from("comment_likes").insert({
        comment_id: commentId,
        user_id: user.id,
      })

      // Increment the likes count
      await supabase
        .from("comments")
        .update({ likes: supabase.rpc("increment", { x: 1 }) })
        .eq("id", commentId)
    }

    // Get the definition for revalidation
    const { data: definition } = await supabase
      .from("definitions")
      .select("word")
      .eq("id", comment.definition_id)
      .single()

    if (definition) {
      revalidatePath(`/define/${definition.word}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error in likeComment:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Check if user has liked a comment
export async function hasUserLikedComment(commentId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return false
    }

    const supabase = createServerClient()

    const { data } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .single()

    return !!data
  } catch (error) {
    console.error("Error in hasUserLikedComment:", error)
    return false
  }
}

