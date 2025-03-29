"use server"
import { createServerClient } from "./supabase"
import type { Provider } from "@supabase/supabase-js"

export type UserProfile = {
  id: string
  username: string
  email: string
  avatar_url?: string
  bio?: string
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const username = formData.get("username") as string

  const supabase = createServerClient()

  // First create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "Failed to create user" }
  }

  // Then insert the user profile
  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id,
    email,
    username,
    password_hash: "MANAGED_BY_SUPABASE_AUTH", // We don't store the actual password
  })

  if (profileError) {
    // Clean up auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { error: profileError.message }
  }

  return { success: true, userId: authData.user.id }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = createServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, userId: data.user.id }
}

export async function signInWithSocial(provider: Provider) {
  const supabase = createServerClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, url: data.url }
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  return { success: true }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return null
    }

    const { data } = await supabase
      .from("users")
      .select("id, username, email, avatar_url, bio")
      .eq("id", session.user.id)
      .single()

    return data
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { error: "Not authenticated" }
  }

  const username = formData.get("username") as string
  const bio = formData.get("bio") as string
  const avatarFile = formData.get("avatar") as File

  let avatar_url = undefined

  // Upload avatar if provided
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split(".").pop()
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile, {
        upsert: true,
      })

    if (uploadError) {
      return { error: uploadError.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName)

    avatar_url = publicUrl
  }

  // Update profile
  const { error } = await supabase
    .from("users")
    .update({
      username,
      bio,
      ...(avatar_url && { avatar_url }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

// Handle OAuth callback and create user profile if needed
export async function handleAuthCallback(code: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return { error: error?.message || "Authentication failed" }
  }

  // Check if user profile exists
  const { data: existingUser } = await supabase.from("users").select("id").eq("id", data.user.id).single()

  if (!existingUser) {
    // Create new user profile for social login
    const email = data.user.email || ""
    const username = email.split("@")[0] + Math.floor(Math.random() * 1000) // Generate a username

    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email,
      username,
      avatar_url: data.user.user_metadata.avatar_url,
      password_hash: "SOCIAL_AUTH",
    })

    if (profileError) {
      console.error("Error creating user profile:", profileError)
      // We don't return an error here as the auth was successful
    }
  }

  return { success: true, userId: data.user.id }
}

