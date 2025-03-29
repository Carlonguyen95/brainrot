"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createAdSlot, updateAdSlot, type AdSlot } from "@/lib/actions/ad-slot-actions"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

interface AdSlotFormProps {
  slot?: AdSlot
}

export default function AdSlotForm({ slot }: AdSlotFormProps) {
  const [name, setName] = useState(slot?.name || "")
  const [slotId, setSlotId] = useState(slot?.slot_id || "")
  const [format, setFormat] = useState(slot?.format || "auto")
  const [position, setPosition] = useState(slot?.position || "flag_banner")
  const [active, setActive] = useState(slot?.active !== false)

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)
    setError(null)

    try {
      let result

      if (slot) {
        // Update existing slot
        result = await updateAdSlot(slot.id, name, slotId, format, position, active)
      } else {
        // Create new slot
        result = await createAdSlot(name, slotId, format, position, active)
      }

      if (result.success) {
        setSuccess(true)

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/admin/ads/slots")
          router.refresh()
        }, 1500)
      } else {
        setError(result.error || "Failed to save ad slot")
      }
    } catch (err) {
      console.error("Error saving ad slot:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{slot ? "Edit Ad Slot" : "Create New Ad Slot"}</CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Ad slot {slot ? "updated" : "created"} successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        <form id="ad-slot-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Slot Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Banner Top, Rectangle Mid"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slotId">Google Ad Slot ID</Label>
            <Input
              id="slotId"
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              required
              placeholder="e.g., 1234567890"
            />
            <p className="text-xs text-gray-500">The unique identifier for this ad slot in Google AdSense</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Ad Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                  <SelectItem value="vertical">Vertical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Ad Position</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flag_banner">Top Banner</SelectItem>
                  <SelectItem value="banner_ad">Mid-Content Banner</SelectItem>
                  <SelectItem value="sticky_pole">Side Sticky</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="active" className="text-base">
                Active
              </Label>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
            </div>
            <p className="text-sm text-gray-500">Only active ad slots will be used when Google Ads are enabled</p>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/ads/slots")}>
          Cancel
        </Button>
        <Button type="submit" form="ad-slot-form" disabled={isLoading}>
          {isLoading ? "Saving..." : slot ? "Update Slot" : "Create Slot"}
        </Button>
      </CardFooter>
    </Card>
  )
}

