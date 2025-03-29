"use server"

import { createServerClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type UserProfile = {
  id: string
  username: string
  email: string
  avatar_url?: string
  bio?: string
  created_at: string
  definition_count: number
  total_upvotes: number
}

// Get user profile by ID with stats
export async function getUserProfileById(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = createServerClient()

    // Get user profile
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, email, avatar_url, bio, created_at")
      .eq("id", userId)
      .single()

    if (error || !user) {
      console.error("Error fetching user profile:", error)
      return null
    }

    // Get definition count
    const { count: definitionCount } = await supabase
      .from("definitions")
      .select("id", { count: "exact" })
      .eq("user_id", userId)

    // Get total upvotes
    const { data: definitions } = await supabase.from("definitions").select("upvotes").eq("user_id", userId)

    const totalUpvotes = definitions?.reduce((sum, def) => sum + (def.upvotes || 0), 0) || 0

    return {
      ...user,
      definition_count: definitionCount || 0,
      total_upvotes: totalUpvotes,
    }
  } catch (error) {
    console.error("Error in getUserProfileById:", error)
    return null
  }
}

// Get user profile by username with stats
export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  try {
    const supabase = createServerClient()

    // Get user profile
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, email, avatar_url, bio, created_at")
      .eq("username", username)
      .single()

    if (error || !user) {
      console.error("Error fetching user profile:", error)
      return null
    }

    // Get definition count
    const { count: definitionCount } = await supabase
      .from("definitions")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)

    // Get total upvotes
    const { data: definitions } = await supabase.from("definitions").select("upvotes").eq("user_id", user.id)

    const totalUpvotes = definitions?.reduce((sum, def) => sum + (def.upvotes || 0), 0) || 0

    return {
      ...user,
      definition_count: definitionCount || 0,
      total_upvotes: totalUpvotes,
    }
  } catch (error) {
    console.error("Error in getUserProfileByUsername:", error)
    return null
  }
}

// Update user profile with enhanced storage
export async function updateUserProfileWithStorage(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const supabase = createServerClient()

    const username = formData.get("username") as string
    const bio = formData.get("bio") as string
    const avatarFile = formData.get("avatar") as File

    // Check if username is already taken by another user
    if (username !== user.username) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .single()

      if (existingUser) {
        return { success: false, error: "Username is already taken" }
      }
    }

    // Handle avatar upload if provided
    let avatar_url = user.avatar_url

    if (avatarFile && avatarFile.size > 0) {
      const fileExt = avatarFile.name.split(".").pop()
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, {
          upsert: true,
        })

      if (uploadError) {
        return { success: false, error: uploadError.message }
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName)

      avatar_url = publicUrl

      // Delete old avatar if it exists and is not the default
      if (user.avatar_url && !user.avatar_url.includes("default-avatar")) {
        const oldFileName = user.avatar_url.split("/").pop()
        if (oldFileName) {
          await supabase.storage.from("avatars").remove([oldFileName])
        }
      }
    }

    // Update profile
    const { error } = await supabase
      .from("users")
      .update({
        username,
        bio,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/profile")
    revalidatePath(`/user/${username}`)

    return { success: true }
  } catch (error) {
    console.error("Error in updateUserProfileWithStorage:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get top contributors (users with most definitions or upvotes)
export async function getTopContributors(
  limit = 10,
  sortBy: "definitions" | "upvotes" = "upvotes",
): Promise<UserProfile[]> {
  try {
    const supabase = createServerClient()

    // Get all users with their definitions
    const { data: users, error } = await supabase.from("users").select(`
        id, 
        username, 
        email, 
        avatar_url, 
        bio, 
        created_at,
        definitions!inner (
          id,
          upvotes
        )
      `)

    if (error || !users) {
      console.error("Error fetching users:", error)
      return []
    }

    // Calculate stats for each user
    const usersWithStats = users.map((user) => {
      const definitionCount = user.definitions.length
      const totalUpvotes = user.definitions.reduce((sum, def) => sum + (def.upvotes || 0), 0)

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        bio: user.bio,
        created_at: user.created_at,
        definition_count: definitionCount,
        total_upvotes: totalUpvotes,
      }
    })

    // Sort by the requested metric
    if (sortBy === "definitions") {
      usersWithStats.sort((a, b) => b.definition_count - a.definition_count)
    } else {
      usersWithStats.sort((a, b) => b.total_upvotes - a.total_upvotes)
    }

    // Return the top users
    return usersWithStats.slice(0, limit)
  } catch (error) {
    console.error("Error in getTopContributors:", error)
    return []
  }
}

