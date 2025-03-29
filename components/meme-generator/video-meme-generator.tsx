"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Upload, Play, Pause, RefreshCw } from "lucide-react"

const VIDEO_TEMPLATES = [
  { id: "minecraft", name: "Minecraft Parkour", src: "/videos/minecraft-parkour.mp4" },
  { id: "subway", name: "Subway Surfers", src: "/videos/subway-surfers.mp4" },
]

const FONTS = [
  { id: "impact", name: "Impact", value: "Impact, sans-serif" },
  { id: "comic", name: "Comic Sans", value: "'Comic Sans MS', cursive" },
  { id: "arial", name: "Arial", value: "Arial, sans-serif" },
  { id: "times", name: "Times New Roman", value: "'Times New Roman', serif" },
]

const TEXT_POSITIONS = [
  { id: "top", name: "Top" },
  { id: "bottom", name: "Bottom" },
  { id: "center", name: "Center" },
]

export default function VideoMemeGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState(VIDEO_TEMPLATES[0])
  const [memeText, setMemeText] = useState("POV: Your brain on TikTok")
  const [fontSize, setFontSize] = useState(36)
  const [fontFamily, setFontFamily] = useState(FONTS[0].value)
  const [textColor, setTextColor] = useState("#ffffff")
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [textPosition, setTextPosition] = useState(TEXT_POSITIONS[0].id)
  const [customVideo, setCustomVideo] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const handleTemplateChange = (templateId: string) => {
    const template = VIDEO_TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      setCustomVideo(null)

      // Reset video playback
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
        setIsPlaying(false)
      }
    }
  }

  const handleFontChange = (fontId: string) => {
    const font = FONTS.find((f) => f.id === fontId)
    if (font) {
      setFontFamily(font.value)
    }
  }

  const handleTextPositionChange = (positionId: string) => {
    setTextPosition(positionId)
  }

  const handleCustomVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCustomVideo(url)

      // Reset video playback
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
        setIsPlaying(false)
      }
    }
  }

  const togglePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    } else {
      videoRef.current.play()
      renderFrame()
    }

    setIsPlaying(!isPlaying)
  }

  const renderFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Configure text style
    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.textAlign = "center"
    ctx.fillStyle = textColor
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = fontSize / 15

    // Draw text based on position
    const x = canvas.width / 2
    let y

    switch (textPosition) {
      case "top":
        y = fontSize + 10
        break
      case "center":
        y = canvas.height / 2
        break
      case "bottom":
      default:
        y = canvas.height - 20
        break
    }

    ctx.strokeText(memeText.toUpperCase(), x, y)
    ctx.fillText(memeText.toUpperCase(), x, y)

    // Continue animation loop if video is playing
    if (!video.paused && !video.ended) {
      animationRef.current = requestAnimationFrame(renderFrame)
    }
  }

  const processVideo = async () => {
    // In a real implementation, this would use a video processing library
    // For this demo, we'll just simulate processing with a delay
    setIsProcessing(true)

    // Pause video during "processing"
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsProcessing(false)

    // In a real implementation, this would download the processed video
    // For this demo, we'll just show an alert
    alert(
      "Video processing is not available in this demo. In a real implementation, this would create and download a video with your text overlay.",
    )
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="template">Choose Video Template</Label>
                <Select value={selectedTemplate.id} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {VIDEO_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={triggerFileInput}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Custom Video
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleCustomVideoUpload}
                  className="hidden"
                />
              </div>

              <div>
                <Label htmlFor="memeText">Meme Text</Label>
                <Input
                  id="memeText"
                  value={memeText}
                  onChange={(e) => setMemeText(e.target.value)}
                  placeholder="Enter meme text"
                />
              </div>

              <div>
                <Label htmlFor="textPosition">Text Position</Label>
                <Select value={textPosition} onValueChange={handleTextPositionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEXT_POSITIONS.map((position) => (
                      <SelectItem key={position.id} value={position.id}>
                        {position.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fontSize">Font Size: {fontSize}px</Label>
                <Slider
                  id="fontSize"
                  min={20}
                  max={80}
                  step={1}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  className="my-2"
                />
              </div>

              <div>
                <Label htmlFor="font">Font Style</Label>
                <Select
                  value={FONTS.find((f) => f.value === fontFamily)?.id || "impact"}
                  onValueChange={handleFontChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((font) => (
                      <SelectItem key={font.id} value={font.id}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex items-center mt-1">
                    <div className="w-8 h-8 rounded border mr-2" style={{ backgroundColor: textColor }} />
                    <Input
                      id="textColor"
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="strokeColor">Stroke Color</Label>
                  <div className="flex items-center mt-1">
                    <div className="w-8 h-8 rounded border mr-2" style={{ backgroundColor: strokeColor }} />
                    <Input
                      id="strokeColor"
                      type="color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={processVideo}
                disabled={isProcessing}
                className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Process & Download
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="sticky top-4">
          <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center mb-4 relative">
            {/* Hidden video element for source */}
            <video
              ref={videoRef}
              src={customVideo || selectedTemplate.src}
              className="hidden"
              onPlay={() => renderFrame()}
              loop
            />

            {/* Canvas for rendering video with text */}
            <canvas ref={canvasRef} className="max-w-full max-h-[500px] object-contain" />

            {/* Play/Pause button overlay */}
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full h-12 w-12 flex items-center justify-center"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Preview your brain rot video meme above. Click play to preview, and "Process & Download" when ready.
          </p>
        </div>
      </div>
    </div>
  )
}

