"use server"

import { createServerClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type AdConfig = {
  id: number
  use_google_ads: boolean
  google_ads_loaded: boolean
  publisher_id: string
  updated_at: string
  updated_by: string | null
}

// Get the current ad configuration
export async function getAdConfig(): Promise<AdConfig | null> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("ad_config")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching ad config:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getAdConfig:", error)
    return null
  }
}

// Update ad configuration
export async function updateAdConfig(
  useGoogleAds: boolean,
  googleAdsLoaded: boolean,
  publisherId: string,
): Promise<{ success: boolean; error?: string }> {
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

    // Get the current config
    const { data: currentConfig } = await supabase
      .from("ad_config")
      .select("id")
      .order("id", { ascending: true })
      .limit(1)
      .single()

    if (!currentConfig) {
      // Create new config if none exists
      const { error: insertError } = await supabase.from("ad_config").insert({
        use_google_ads: useGoogleAds,
        google_ads_loaded: googleAdsLoaded,
        publisher_id: publisherId,
        updated_by: user.id,
      })

      if (insertError) {
        return { success: false, error: insertError.message }
      }
    } else {
      // Update existing config
      const { error: updateError } = await supabase
        .from("ad_config")
        .update({
          use_google_ads: useGoogleAds,
          google_ads_loaded: googleAdsLoaded,
          publisher_id: publisherId,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq("id", currentConfig.id)

      if (updateError) {
        return { success: false, error: updateError.message }
      }
    }

    // Revalidate all pages that use ad config
    revalidatePath("/")
    revalidatePath("/define/[word]")
    revalidatePath("/random")
    revalidatePath("/admin/ads")

    return { success: true }
  } catch (error) {
    console.error("Error in updateAdConfig:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

