"use server"

import { createServerClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type AdSlot = {
  id: number
  name: string
  slot_id: string
  format: string
  position: string
  active: boolean
  created_at: string
  updated_at: string
}

// Get all ad slots
export async function getAdSlots(): Promise<AdSlot[]> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("ad_slots").select("*").order("position", { ascending: true })

    if (error) {
      console.error("Error fetching ad slots:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAdSlots:", error)
    return []
  }
}

// Get a single ad slot by ID
export async function getAdSlot(id: number): Promise<AdSlot | null> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("ad_slots").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching ad slot:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getAdSlot:", error)
    return null
  }
}

// Create a new ad slot
export async function createAdSlot(
  name: string,
  slotId: string,
  format: string,
  position: string,
  active: boolean,
): Promise<{ success: boolean; error?: string; id?: number }> {
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

    const { data, error } = await supabase
      .from("ad_slots")
      .insert({
        name,
        slot_id: slotId,
        format,
        position,
        active,
      })
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/ads/slots")

    return { success: true, id: data.id }
  } catch (error) {
    console.error("Error in createAdSlot:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Update an existing ad slot
export async function updateAdSlot(
  id: number,
  name: string,
  slotId: string,
  format: string,
  position: string,
  active: boolean,
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

    const { error } = await supabase
      .from("ad_slots")
      .update({
        name,
        slot_id: slotId,
        format,
        position,
        active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/ads/slots")

    return { success: true }
  } catch (error) {
    console.error("Error in updateAdSlot:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Delete an ad slot
export async function deleteAdSlot(id: number): Promise<{ success: boolean; error?: string }> {
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

    const { error } = await supabase.from("ad_slots").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/ads/slots")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteAdSlot:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

