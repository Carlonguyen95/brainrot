"use server"

import { createServerClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

export type DailyMetrics = {
  date: string
  impressions: number
  clicks: number
  ctr: number
}

export type AdPerformance = {
  id: number
  title: string
  impressions: number
  clicks: number
  ctr: number
}

// Get daily ad metrics for the last 30 days
export async function getDailyMetrics(days = 30): Promise<DailyMetrics[]> {
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

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Query metrics aggregated by date
    const { data, error } = await supabase
      .from("ad_metrics")
      .select("date, impressions, clicks")
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])
      .order("date", { ascending: true })

    if (error) {
      console.error("Error fetching daily metrics:", error)
      return []
    }

    // Aggregate metrics by date
    const metricsByDate: Record<string, { impressions: number; clicks: number }> = {}

    // Initialize with all dates in the range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0]
      metricsByDate[dateStr] = { impressions: 0, clicks: 0 }
    }

    // Fill in actual data
    data.forEach((metric) => {
      if (metricsByDate[metric.date]) {
        metricsByDate[metric.date].impressions += metric.impressions
        metricsByDate[metric.date].clicks += metric.clicks
      }
    })

    // Convert to array and calculate CTR
    return Object.entries(metricsByDate).map(([date, metrics]) => {
      const { impressions, clicks } = metrics
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
      return {
        date,
        impressions,
        clicks,
        ctr,
      }
    })
  } catch (error) {
    console.error("Error in getDailyMetrics:", error)
    return []
  }
}

// Get performance metrics by ad
export async function getAdPerformance(): Promise<AdPerformance[]> {
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

    // Query custom ads
    const { data: ads, error: adsError } = await supabase.from("custom_ads").select("id, title")

    if (adsError) {
      console.error("Error fetching ads:", adsError)
      return []
    }

    // Query metrics for each ad
    const adPerformance: AdPerformance[] = []

    for (const ad of ads) {
      const { data: metrics, error: metricsError } = await supabase
        .from("ad_metrics")
        .select("impressions, clicks")
        .eq("ad_id", ad.id)

      if (metricsError) {
        console.error(`Error fetching metrics for ad ${ad.id}:`, metricsError)
        continue
      }

      // Calculate totals
      const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0)
      const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0)
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

      adPerformance.push({
        id: ad.id,
        title: ad.title,
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr,
      })
    }

    // Sort by impressions (descending)
    return adPerformance.sort((a, b) => b.impressions - a.impressions)
  } catch (error) {
    console.error("Error in getAdPerformance:", error)
    return []
  }
}

