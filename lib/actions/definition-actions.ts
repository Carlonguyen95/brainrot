"use server"

import { createServerClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { Definition } from "@/lib/definitions"

// Create a new definition with enhanced storage functionality
export async function createDefinitionWithStorage(
  formData: FormData,
): Promise<{ success: boolean; error?: string; definitionId?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "You must be logged in to submit a definition" }
    }

    const word = (formData.get("word") as string).toLowerCase().trim()
    const definition = formData.get("definition") as string
    const example = formData.get("example") as string
    const tagsString = formData.get("tags") as string

    if (!word || !definition) {
      return { success: false, error: "Word and definition are required" }
    }

    const supabase = createServerClient()

    // Handle image upload if provided
    const imageFile = formData.get("image") as File
    let imageUrl = null

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `definition-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("definition_images")
        .upload(fileName, imageFile, {
          upsert: true,
        })

      if (uploadError) {
        return { success: false, error: uploadError.message }
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("definition_images").getPublicUrl(fileName)

      imageUrl = publicUrl
    }

    // Insert the definition
    const { data: definitionData, error: definitionError } = await supabase
      .from("definitions")
      .insert({
        word,
        definition,
        example,
        user_id: user.id,
        image_url: imageUrl,
      })
      .select("id")
      .single()

    if (definitionError) {
      return { success: false, error: definitionError.message }
    }

    // Process tags
    if (tagsString) {
      const tagNames = tagsString.split(",").map((tag) => tag.trim().toLowerCase())

      // Insert tags that don't exist yet
      for (const tagName of tagNames) {
        if (!tagName) continue

        // Check if tag exists
        const { data: existingTag } = await supabase.from("tags").select("id").eq("name", tagName).single()

        let tagId: string

        if (existingTag) {
          tagId = existingTag.id
        } else {
          // Create new tag
          const { data: newTag, error: tagError } = await supabase
            .from("tags")
            .insert({ name: tagName })
            .select("id")
            .single()

          if (tagError) {
            console.error("Error creating tag:", tagError)
            continue
          }

          tagId = newTag.id
        }

        // Link tag to definition
        await supabase.from("definition_tags").insert({
          definition_id: definitionData.id,
          tag_id: tagId,
        })
      }
    }

    // Revalidate relevant paths
    revalidatePath(`/define/${encodeURIComponent(word)}`)
    revalidatePath("/")

    return { success: true, definitionId: definitionData.id }
  } catch (error) {
    console.error("Error in createDefinitionWithStorage:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Update an existing definition
export async function updateDefinitionWithStorage(
  id: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "You must be logged in to update a definition" }
    }

    const supabase = createServerClient()

    // Check if user owns this definition
    const { data: definitionData } = await supabase
      .from("definitions")
      .select("user_id, word, image_url")
      .eq("id", id)
      .single()

    if (!definitionData || definitionData.user_id !== user.id) {
      return { success: false, error: "You do not have permission to edit this definition" }
    }

    const definition = formData.get("definition") as string
    const example = formData.get("example") as string
    const tagsString = formData.get("tags") as string
    const currentImageUrl = (formData.get("currentImageUrl") as string) || definitionData.image_url

    // Handle image upload if provided
    const imageFile = formData.get("image") as File
    let imageUrl = currentImageUrl

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `definition-${id}-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("definition_images")
        .upload(fileName, imageFile, {
          upsert: true,
        })

      if (uploadError) {
        return { success: false, error: uploadError.message }
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("definition_images").getPublicUrl(fileName)

      imageUrl = publicUrl

      // Delete old image if it exists
      if (currentImageUrl) {
        const oldFileName = currentImageUrl.split("/").pop()
        if (oldFileName) {
          await supabase.storage.from("definition_images").remove([oldFileName])
        }
      }
    }

    // Update definition
    const { error: updateError } = await supabase
      .from("definitions")
      .update({
        definition,
        example,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Handle tags if provided
    if (tagsString) {
      // First, remove existing tags
      await supabase.from("definition_tags").delete().eq("definition_id", id)

      // Then add new tags
      const tagNames = tagsString.split(",").map((tag) => tag.trim().toLowerCase())

      for (const tagName of tagNames) {
        if (!tagName) continue

        // Check if tag exists
        const { data: existingTag } = await supabase.from("tags").select("id").eq("name", tagName).single()

        let tagId: string

        if (existingTag) {
          tagId = existingTag.id
        } else {
          // Create new tag
          const { data: newTag, error: tagError } = await supabase
            .from("tags")
            .insert({ name: tagName })
            .select("id")
            .single()

          if (tagError) {
            console.error("Error creating tag:", tagError)
            continue
          }

          tagId = newTag.id
        }

        // Link tag to definition
        await supabase.from("definition_tags").insert({
          definition_id: id,
          tag_id: tagId,
        })
      }
    }

    // Revalidate relevant paths
    revalidatePath(`/define/${encodeURIComponent(definitionData.word)}`)
    revalidatePath("/my-definitions")

    return { success: true }
  } catch (error) {
    console.error("Error in updateDefinitionWithStorage:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get definitions with pagination and filtering
export async function getDefinitionsWithFilters(options: {
  page?: number
  limit?: number
  word?: string
  userId?: string
  tagId?: string
  sortBy?: "newest" | "popular"
}): Promise<{ definitions: Definition[]; totalCount: number }> {
  try {
    const { page = 1, limit = 10, word, userId, tagId, sortBy = "newest" } = options

    const offset = (page - 1) * limit

    const supabase = createServerClient()

    // Build the query
    let query = supabase.from("definitions").select(
      `
        *,
        users!inner (username),
        definition_tags!inner (
          tags:tag_id (name)
        )
      `,
      { count: "exact" },
    )

    // Apply filters
    if (word) {
      query = query.eq("word", word.toLowerCase())
    }

    if (userId) {
      query = query.eq("user_id", userId)
    }

    if (tagId) {
      query = query.eq("definition_tags.tag_id", tagId)
    }

    // Apply sorting
    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false })
    } else if (sortBy === "popular") {
      query = query.order("upvotes", { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    // Execute the query
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching definitions:", error)
      return { definitions: [], totalCount: 0 }
    }

    // Transform the data to match our Definition type
    const definitions = data.map((item) => ({
      ...item,
      username: item.users?.username,
      tags: item.definition_tags.map((dt: any) => dt.tags.name),
    })) as Definition[]

    return {
      definitions,
      totalCount: count || 0,
    }
  } catch (error) {
    console.error("Error in getDefinitionsWithFilters:", error)
    return { definitions: [], totalCount: 0 }
  }
}

// Get a single definition by ID
export async function getDefinitionById(id: string): Promise<Definition | null> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("definitions")
      .select(`
        *,
        users!inner (username),
        definition_tags!inner (
          tags:tag_id (name)
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching definition:", error)
      return null
    }

    return {
      ...data,
      username: data.users?.username,
      tags: data.definition_tags.map((dt: any) => dt.tags.name),
    } as Definition
  } catch (error) {
    console.error("Error in getDefinitionById:", error)
    return null
  }
}

// Delete a definition with proper cleanup
export async function deleteDefinitionWithStorage(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "You must be logged in to delete a definition" }
    }

    const supabase = createServerClient()

    // Check if user owns this definition
    const { data: definitionData } = await supabase
      .from("definitions")
      .select("user_id, word, image_url")
      .eq("id", id)
      .single()

    if (!definitionData || definitionData.user_id !== user.id) {
      return { success: false, error: "You do not have permission to delete this definition" }
    }

    // Delete associated image if it exists
    if (definitionData.image_url) {
      const fileName = definitionData.image_url.split("/").pop()
      if (fileName) {
        await supabase.storage.from("definition_images").remove([fileName])
      }
    }

    // Delete definition (cascade will handle definition_tags)
    const { error: deleteError } = await supabase.from("definitions").delete().eq("id", id)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    // Revalidate relevant paths
    revalidatePath(`/define/${encodeURIComponent(definitionData.word)}`)
    revalidatePath("/my-definitions")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteDefinitionWithStorage:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

