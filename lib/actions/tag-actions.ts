"use server"

import { createServerClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type Tag = {
  id: string
  name: string
  definition_count: number
}

// Get all tags with definition count
export async function getAllTags(): Promise<Tag[]> {
  try {
    const supabase = createServerClient()

    // This query gets all tags with a count of how many definitions use each tag
    const { data, error } = await supabase.from("tags").select(`
        id,
        name,
        definition_tags!inner (
          definition_id
        )
      `)

    if (error) {
      console.error("Error fetching tags:", error)
      return []
    }

    // Transform the data to include definition count
    return data.map((tag) => ({
      id: tag.id,
      name: tag.name,
      definition_count: tag.definition_tags.length,
    }))
  } catch (error) {
    console.error("Error in getAllTags:", error)
    return []
  }
}

// Get popular tags (most used)
export async function getPopularTags(limit = 10): Promise<Tag[]> {
  try {
    const tags = await getAllTags()

    // Sort by definition count and take the top ones
    return tags.sort((a, b) => b.definition_count - a.definition_count).slice(0, limit)
  } catch (error) {
    console.error("Error in getPopularTags:", error)
    return []
  }
}

// Get a single tag by ID
export async function getTagById(id: string): Promise<Tag | null> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("tags")
      .select(`
        id,
        name,
        definition_tags!inner (
          definition_id
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching tag:", error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      definition_count: data.definition_tags.length,
    }
  } catch (error) {
    console.error("Error in getTagById:", error)
    return null
  }
}

// Get a single tag by name
export async function getTagByName(name: string): Promise<Tag | null> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("tags")
      .select(`
        id,
        name,
        definition_tags!inner (
          definition_id
        )
      `)
      .eq("name", name.toLowerCase())
      .single()

    if (error) {
      console.error("Error fetching tag:", error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      definition_count: data.definition_tags.length,
    }
  } catch (error) {
    console.error("Error in getTagByName:", error)
    return null
  }
}

// Create a new tag (admin only)
export async function createTag(name: string): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "You must be logged in to create a tag" }
    }

    // Check if user is an admin
    const supabase = createServerClient()
    const { data: adminData } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).single()

    if (!adminData) {
      return { success: false, error: "Only admins can create tags directly" }
    }

    // Check if tag already exists
    const { data: existingTag } = await supabase.from("tags").select("id").eq("name", name.toLowerCase()).single()

    if (existingTag) {
      return { success: false, error: "Tag already exists" }
    }

    // Create the tag
    const { data, error } = await supabase.from("tags").insert({ name: name.toLowerCase() }).select("id").single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/tags")

    return { success: true, id: data.id }
  } catch (error) {
    console.error("Error in createTag:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Update a tag (admin only)
export async function updateTag(id: string, name: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "You must be logged in to update a tag" }
    }

    // Check if user is an admin
    const supabase = createServerClient()
    const { data: adminData } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).single()

    if (!adminData) {
      return { success: false, error: "Only admins can update tags" }
    }

    // Check if tag with new name already exists
    const { data: existingTag } = await supabase
      .from("tags")
      .select("id")
      .eq("name", name.toLowerCase())
      .neq("id", id)
      .single()

    if (existingTag) {
      return { success: false, error: "Another tag with this name already exists" }
    }

    // Update the tag
    const { error } = await supabase.from("tags").update({ name: name.toLowerCase() }).eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/tags")
    revalidatePath(`/tag/${encodeURIComponent(name.toLowerCase())}`)

    return { success: true }
  } catch (error) {
    console.error("Error in updateTag:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Merge tags (admin only)
export async function mergeTags(sourceId: string, targetId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "You must be logged in to merge tags" }
    }

    // Check if user is an admin
    const supabase = createServerClient()
    const { data: adminData } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).single()

    if (!adminData) {
      return { success: false, error: "Only admins can merge tags" }
    }

    // Get source and target tags
    const { data: sourceTags } = await supabase.from("definition_tags").select("definition_id").eq("tag_id", sourceId)

    if (!sourceTags || sourceTags.length === 0) {
      return { success: false, error: "Source tag has no definitions" }
    }

    // Get target tag info for revalidation
    const { data: targetTag } = await supabase.from("tags").select("name").eq("id", targetId).single()

    if (!targetTag) {
      return { success: false, error: "Target tag not found" }
    }

    // Update all definition_tags entries to use the target tag
    for (const item of sourceTags) {
      // Check if this definition already has the target tag
      const { data: existingTag } = await supabase
        .from("definition_tags")
        .select("id")
        .eq("definition_id", item.definition_id)
        .eq("tag_id", targetId)
        .single()

      if (!existingTag) {
        // Only add if it doesn't exist
        await supabase.from("definition_tags").insert({
          definition_id: item.definition_id,
          tag_id: targetId,
        })
      }
    }

    // Delete all source tag associations
    await supabase.from("definition_tags").delete().eq("tag_id", sourceId)

    // Delete the source tag
    await supabase.from("tags").delete().eq("id", sourceId)

    revalidatePath("/admin/tags")
    revalidatePath(`/tag/${encodeURIComponent(targetTag.name)}`)

    return { success: true }
  } catch (error) {
    console.error("Error in mergeTags:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Delete a tag (admin only)
export async function deleteTag(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "You must be logged in to delete a tag" }
    }

    // Check if user is an admin
    const supabase = createServerClient()
    const { data: adminData } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).single()

    if (!adminData) {
      return { success: false, error: "Only admins can delete tags" }
    }

    // Get tag info for revalidation
    const { data: tag } = await supabase.from("tags").select("name").eq("id", id).single()

    if (!tag) {
      return { success: false, error: "Tag not found" }
    }

    // Delete all tag associations
    await supabase.from("definition_tags").delete().eq("tag_id", id)

    // Delete the tag
    const { error } = await supabase.from("tags").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/tags")
    revalidatePath(`/tag/${encodeURIComponent(tag.name)}`)

    return { success: true }
  } catch (error) {
    console.error("Error in deleteTag:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

