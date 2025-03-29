"use server"

import { createServerClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type AdminUser = {
  user_id: string
  username: string
  email: string
  avatar_url: string | null
  created_at: string
}

// Check if the current user is an admin
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return false
    }

    const supabase = createServerClient()
    const { data } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).single()

    return !!data
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// Get all admin users
export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return []
    }

    // Check if user is an admin
    const supabase = createServerClient()
    const { data: adminData } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).single()

    if (!adminData) {
      return []
    }

    // Get all admin users with their profile info
    const { data, error } = await supabase
      .from("admin_users")
      .select(`
        user_id,
        created_at,
        users!inner (
          username,
          email,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching admin users:", error)
      return []
    }

    // Transform the data to match our AdminUser type
    return data.map((item) => ({
      user_id: item.user_id,
      username: item.users.username,
      email: item.users.email,
      avatar_url: item.users.avatar_url,
      created_at: item.created_at,
    }))
  } catch (error) {
    console.error("Error in getAdminUsers:", error)
    return []
  }
}

// Add a new admin user
export async function addAdminUser(username: string): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if current user is an admin
    const supabase = createServerClient()
    const { data: adminData } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", currentUser.id)
      .single()

    if (!adminData) {
      return { success: false, error: "Not authorized" }
    }

    // Find the user by username
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single()

    if (userError || !userData) {
      return { success: false, error: "User not found" }
    }

    // Check if user is already an admin
    const { data: existingAdmin } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userData.id)
      .single()

    if (existingAdmin) {
      return { success: false, error: "User is already an admin" }
    }

    // Add user as admin
    const { error } = await supabase.from("admin_users").insert({
      user_id: userData.id,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/users")

    return { success: true }
  } catch (error) {
    console.error("Error in addAdminUser:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Remove an admin user
export async function removeAdminUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if current user is an admin
    const supabase = createServerClient()
    const { data: adminData } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", currentUser.id)
      .single()

    if (!adminData) {
      return { success: false, error: "Not authorized" }
    }

    // Prevent removing yourself
    if (userId === currentUser.id) {
      return { success: false, error: "You cannot remove yourself as an admin" }
    }

    // Remove user from admin
    const { error } = await supabase.from("admin_users").delete().eq("user_id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/users")

    return { success: true }
  } catch (error) {
    console.error("Error in removeAdminUser:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

