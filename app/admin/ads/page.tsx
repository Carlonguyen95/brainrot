"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAdConfig, updateAdConfig } from "@/lib/actions/ad-config-actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function AdConfigPage() {
  const [useGoogleAds, setUseGoogleAds] = useState(false)
  const [googleAdsLoaded, setGoogleAdsLoaded] = useState(false)
  const [publisherId, setPublisherId] = useState("ca-pub-XXXXXXXXXXXXXXXX")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await getAdConfig()
        if (config) {
          setUseGoogleAds(config.use_google_ads)
          setGoogleAdsLoaded(config.google_ads_loaded)
          setPublisherId(config.publisher_id)
        }
      } catch (err) {
        console.error("Error loading ad config:", err)
        setError("Failed to load ad configuration")
      } finally {
        setIsLoadingConfig(false)
      }
    }

    loadConfig()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)
    setError(null)

    try {
      const result = await updateAdConfig(useGoogleAds, googleAdsLoaded, publisherId)

      if (result.success) {
        setSuccess(true)
        router.refresh()
      } else {
        setError(result.error || "Failed to update ad configuration")
      }
    } catch (err) {
      console.error("Error updating ad config:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingConfig) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500">Loading configuration...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Ad Configuration</h1>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Global Ad Settings</CardTitle>
          <CardDescription>Configure how ads are displayed across the Brain Rot Dictionary</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">Ad configuration updated successfully!</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">{error}</AlertDescription>
            </Alert>
          )}

          <form id="ad-config-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-google-ads" className="text-base">
                  Use Google Ads
                </Label>
                <Switch id="use-google-ads" checked={useGoogleAds} onCheckedChange={setUseGoogleAds} />
              </div>
              <p className="text-sm text-gray-500">When enabled, Google Ads will be displayed instead of custom ads.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="google-ads-loaded" className="text-base">
                  Google Ads Loaded
                </Label>
                <Switch
                  id="google-ads-loaded"
                  checked={googleAdsLoaded}
                  onCheckedChange={setGoogleAdsLoaded}
                  disabled={!useGoogleAds}
                />
              </div>
              <p className="text-sm text-gray-500">
                Only enable this when Google Ads are properly set up and ready to display. If disabled, no ads will be
                shown even if Google Ads are enabled.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publisher-id">Google AdSense Publisher ID</Label>
              <Input
                id="publisher-id"
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                disabled={!useGoogleAds}
              />
              <p className="text-sm text-gray-500">Your Google AdSense publisher ID, starting with "ca-pub-".</p>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="ad-config-form" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Save Configuration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

