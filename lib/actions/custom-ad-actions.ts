"use server"

import { createServerClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type CustomAd = {
  id: number
  title: string
  description: string | null
  cta_text: string | null
  link_url: string
  bg_color: string
  border_color: string
  text_color: string
  image_url: string | null
  position: string
  active: boolean
  priority: number
  start_date: string
  end_date: string | null
  created_at: string
  updated_at: string
  created_by: string
}

// Get all custom ads
export async function getCustomAds(): Promise<CustomAd[]> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("custom_ads").select("*").order("priority", { ascending: false })

    if (error) {
      console.error("Error fetching custom ads:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getCustomAds:", error)
    return []
  }
}

// Get custom ads by position
export async function getCustomAdsByPosition(position: string): Promise<CustomAd[]> {
  try {
    const supabase = createServerClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("custom_ads")
      .select("*")
      .eq("position", position)
      .eq("active", true)
      .lte("start_date", now)
      .or(`end_date.is.null,end_date.gt.${now}`)
      .order("priority", { ascending: false })

    if (error) {
      console.error(`Error fetching custom ads for position ${position}:`, error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getCustomAdsByPosition:", error)
    return []
  }
}

// Get a single custom ad by ID
export async function getCustomAd(id: number): Promise<CustomAd | null> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("custom_ads").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching custom ad:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getCustomAd:", error)
    return null
  }
}

// Create a new custom ad
export async function createCustomAd(formData: FormData): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if user is an admin
    const supabase = createServerClient()
    const { data: adminData } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).single()

    if (!adminData) {
      return { success: false, error: "Not authorized" }
    }

    // Extract form data
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const ctaText = formData.get("ctaText") as string
    const linkUrl = formData.get("linkUrl") as string
    const bgColor = formData.get("bgColor") as string
    const borderColor = formData.get("borderColor") as string
    const textColor = formData.get("textColor") as string
    const position = formData.get("position") as string
    const active = formData.get("active") === "true"
    const priority = Number.parseInt(formData.get("priority") as string) || 0
    const startDate = formData.get("startDate") as string
    const endDate = (formData.get("endDate") as string) || null

    // Handle image upload if provided
    const imageFile = formData.get("image") as File
    let imageUrl = null

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `ad-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("ad_images")
        .upload(fileName, imageFile, {
          upsert: true,
        })

      if (uploadError) {
        return { success: false, error: uploadError.message }
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("ad_images").getPublicUrl(fileName)

      imageUrl = publicUrl
    }

    // Insert the new ad
    const { data, error } = await supabase
      .from("custom_ads")
      .insert({
        title,
        description,
        cta_text: ctaText,
        link_url: linkUrl,
        bg_color: bgColor,
        border_color: borderColor,
        text_color: textColor,
        image_url: imageUrl,
        position,
        active,
        priority,
        start_date: startDate || new Date().toISOString(),
        end_date: endDate || null,
        created_by: user.id,
      })
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/ads/custom")

    return { success: true, id: data.id }
  } catch (error) {
    console.error("Error in createCustomAd:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Update an existing custom ad
export async function updateCustomAd(id: number, formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if user is an admin
    const supabase = createServerClient()
    const { data: adminData } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).single()

    if (!adminData) {
      return { success: false, error: "Not authorized" }
    }

    // Extract form data
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const ctaText = formData.get("ctaText") as string
    const linkUrl = formData.get("linkUrl") as string
    const bgColor = formData.get("bgColor") as string
    const borderColor = formData.get("borderColor") as string
    const textColor = formData.get("textColor") as string
    const position = formData.get("position") as string
    const active = formData.get("active") === "true"
    const priority = Number.parseInt(formData.get("priority") as string) || 0
    const startDate = formData.get("startDate") as string
    const endDate = (formData.get("endDate") as string) || null
    const currentImageUrl = formData.get("currentImageUrl") as string

    // Handle image upload if provided
    const imageFile = formData.get("image") as File
    let imageUrl = currentImageUrl

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `ad-${id}-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("ad_images")
        .upload(fileName, imageFile, {
          upsert: true,
        })

      if (uploadError) {
        return { success: false, error: uploadError.message }
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("ad_images").getPublicUrl(fileName)

      imageUrl = publicUrl
    }

    // Update the ad
    const { error } = await supabase
      .from("custom_ads")
      .update({
        title,
        description,
        cta_text: ctaText,
        link_url: linkUrl,
        bg_color: bgColor,
        border_color: borderColor,
        text_color: textColor,
        image_url: imageUrl,
        position,
        active,
        priority,
        start_date: startDate || new Date().toISOString(),
        end_date: endDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/ads/custom")

    return { success: true }
  } catch (error) {
    console.error("Error in updateCustomAd:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Delete a custom ad
export async function deleteCustomAd(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if user is an admin
    const supabase = createServerClient()
    const { data: adminData } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).single()

    if (!adminData) {
      return { success: false, error: "Not authorized" }
    }

    // Get the ad to check if it has an image
    const { data: ad } = await supabase.from("custom_ads").select("image_url").eq("id", id).single()

    // Delete the ad
    const { error } = await supabase.from("custom_ads").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Delete the image if it exists
    if (ad?.image_url) {
      // Extract the file name from the URL
      const fileName = ad.image_url.split("/").pop()
      if (fileName) {
        await supabase.storage.from("ad_images").remove([fileName])
      }
    }

    revalidatePath("/admin/ads/custom")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteCustomAd:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Track ad impression
export async function trackAdImpression(adId: number): Promise<void> {
  try {
    const supabase = createServerClient()
    const today = new Date().toISOString().split("T")[0]

    // Check if we already have a record for today
    const { data: existingMetric } = await supabase
      .from("ad_metrics")
      .select("id, impressions")
      .eq("ad_id", adId)
      .eq("date", today)
      .single()

    if (existingMetric) {
      // Update existing record
      await supabase
        .from("ad_metrics")
        .update({
          impressions: existingMetric.impressions + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingMetric.id)
    } else {
      // Create new record
      await supabase.from("ad_metrics").insert({
        ad_id: adId,
        date: today,
        impressions: 1,
        clicks: 0,
      })
    }
  } catch (error) {
    console.error("Error tracking ad impression:", error)
  }
}

// Track ad click
export async function trackAdClick(adId: number): Promise<void> {
  try {
    const supabase = createServerClient()
    const today = new Date().toISOString().split("T")[0]

    // Check if we already have a record for today
    const { data: existingMetric } = await supabase
      .from("ad_metrics")
      .select("id, clicks")
      .eq("ad_id", adId)
      .eq("date", today)
      .single()

    if (existingMetric) {
      // Update existing record
      await supabase
        .from("ad_metrics")
        .update({
          clicks: existingMetric.clicks + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingMetric.id)
    } else {
      // Create new record
      await supabase.from("ad_metrics").insert({
        ad_id: adId,
        date: today,
        impressions: 0,
        clicks: 1,
      })
    }
  } catch (error) {
    console.error("Error tracking ad click:", error)
  }
}

