"use client"

import type React from "react"

import { useState, useRef } from "react"
import { uploadMedia } from "@/lib/actions/media-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Upload } from "lucide-react"

interface MediaUploadProps {
  onUploadComplete?: (url: string) => void
  allowedTypes?: string[]
  maxSizeMB?: number
  bucket?: string
}

export default function MediaUpload({
  onUploadComplete,
  allowedTypes = ["image/*", "video/*", "audio/*"],
  maxSizeMB = 10,
  bucket = "public",
}: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]

    if (!selectedFile) {
      setFile(null)
      setPreview(null)
      return
    }

    // Validate file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`)
      setFile(null)
      setPreview(null)
      return
    }

    setFile(selectedFile)

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }

    setError(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await uploadMedia(file, bucket)

      if (result.success && result.url) {
        setSuccess(true)

        if (onUploadComplete) {
          onUploadComplete(result.url)
        }

        // Reset form
        setFile(null)
        setPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        setError(result.error || "Upload failed")
      }
    } catch (err) {
      console.error("Error uploading file:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Media</CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">File uploaded successfully!</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              accept={allowedTypes.join(",")}
              onChange={handleFileChange}
            />
            <p className="text-xs text-gray-500">
              Max file size: {maxSizeMB}MB. Allowed types: {allowedTypes.join(", ")}
            </p>
          </div>

          {preview && (
            <div className="mt-4">
              <Label>Preview</Label>
              <div className="mt-2 border rounded-md p-2">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  className="max-h-48 max-w-full object-contain mx-auto"
                />
              </div>
            </div>
          )}

          {file && !preview && (
            <div className="mt-4 border rounded-md p-4">
              <p className="text-sm">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={!file || isLoading} className="w-full">
          {isLoading ? (
            <span className="flex items-center">
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </span>
          ) : (
            <span className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

