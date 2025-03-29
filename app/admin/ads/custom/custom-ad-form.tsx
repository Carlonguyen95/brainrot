"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createCustomAd, updateCustomAd, type CustomAd } from "@/lib/actions/custom-ad-actions"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Upload, X } from "lucide-react"

interface CustomAdFormProps {
  ad?: CustomAd
}

export default function CustomAdForm({ ad }: CustomAdFormProps) {
  const [title, setTitle] = useState(ad?.title || "")
  const [description, setDescription] = useState(ad?.description || "")
  const [ctaText, setCtaText] = useState(ad?.cta_text || "")
  const [linkUrl, setLinkUrl] = useState(ad?.link_url || "/")
  const [bgColor, setBgColor] = useState(ad?.bg_color || "bg-blue-100")
  const [borderColor, setBorderColor] = useState(ad?.border_color || "border-blue-300")
  const [textColor, setTextColor] = useState(ad?.text_color || "text-blue-800")
  const [position, setPosition] = useState(ad?.position || "banner_ad")
  const [active, setActive] = useState(ad?.active !== false)
  const [priority, setPriority] = useState(ad?.priority?.toString() || "0")
  const [startDate, setStartDate] = useState(ad?.start_date?.split("T")[0] || new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(ad?.end_date?.split("T")[0] || "")

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(ad?.image_url || null)

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("ctaText", ctaText)
      formData.append("linkUrl", linkUrl)
      formData.append("bgColor", bgColor)
      formData.append("borderColor", borderColor)
      formData.append("textColor", textColor)
      formData.append("position", position)
      formData.append("active", active.toString())
      formData.append("priority", priority)
      formData.append("startDate", startDate)
      if (endDate) formData.append("endDate", endDate)
      if (imageFile) formData.append("image", imageFile)
      if (ad?.image_url) formData.append("currentImageUrl", ad.image_url)

      let result

      if (ad) {
        // Update existing ad
        result = await updateCustomAd(ad.id, formData)
      } else {
        // Create new ad
        result = await createCustomAd(formData)
      }

      if (result.success) {
        setSuccess(true)

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/admin/ads/custom")
          router.refresh()
        }, 1500)
      } else {
        setError(result.error || "Failed to save ad")
      }
    } catch (err) {
      console.error("Error saving ad:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{ad ? "Edit Ad" : "Create New Ad"}</CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Ad {ad ? "updated" : "created"} successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        <form id="custom-ad-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Ad Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaText">Call to Action Text</Label>
              <Input
                id="ctaText"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g., Shop Now, Learn More"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkUrl">Link URL</Label>
              <Input id="linkUrl" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Ad Image (Optional)</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image")?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {imagePreview ? "Change Image" : "Upload Image"}
              </Button>
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

              {imagePreview && (
                <Button type="button" variant="outline" onClick={removeImage} className="text-red-500">
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            {imagePreview && (
              <div className="mt-4 relative w-full max-w-xs">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Ad preview"
                  width={200}
                  height={200}
                  className="rounded border object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bgColor">Background Color</Label>
              <Select value={bgColor} onValueChange={setBgColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-blue-100">Blue</SelectItem>
                  <SelectItem value="bg-purple-100">Purple</SelectItem>
                  <SelectItem value="bg-green-100">Green</SelectItem>
                  <SelectItem value="bg-yellow-100">Yellow</SelectItem>
                  <SelectItem value="bg-red-100">Red</SelectItem>
                  <SelectItem value="bg-gray-100">Gray</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="borderColor">Border Color</Label>
              <Select value={borderColor} onValueChange={setBorderColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="border-blue-300">Blue</SelectItem>
                  <SelectItem value="border-purple-300">Purple</SelectItem>
                  <SelectItem value="border-green-300">Green</SelectItem>
                  <SelectItem value="border-yellow-300">Yellow</SelectItem>
                  <SelectItem value="border-red-300">Red</SelectItem>
                  <SelectItem value="border-gray-300">Gray</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <Select value={textColor} onValueChange={setTextColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-blue-800">Blue</SelectItem>
                  <SelectItem value="text-purple-800">Purple</SelectItem>
                  <SelectItem value="text-green-800">Green</SelectItem>
                  <SelectItem value="text-yellow-800">Yellow</SelectItem>
                  <SelectItem value="text-red-800">Red</SelectItem>
                  <SelectItem value="text-gray-800">Gray</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                min="0"
                max="100"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />
              <p className="text-xs text-gray-500">Higher priority ads are shown more frequently (0-100)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <p className="text-xs text-gray-500">Leave blank for no end date</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="active" className="text-base">
                Active
              </Label>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
            </div>
            <p className="text-sm text-gray-500">Only active ads will be displayed on the site</p>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/ads/custom")}>
          Cancel
        </Button>
        <Button type="submit" form="custom-ad-form" disabled={isLoading}>
          {isLoading ? "Saving..." : ad ? "Update Ad" : "Create Ad"}
        </Button>
      </CardFooter>
    </Card>
  )
}

