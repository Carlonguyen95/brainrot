"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Upload, RefreshCw } from "lucide-react"

const MEME_TEMPLATES = [
  { id: "distracted", name: "Distracted Boyfriend", src: "/placeholder.svg?height=400&width=600" },
  { id: "drake", name: "Drake Hotline Bling", src: "/placeholder.svg?height=600&width=600" },
  { id: "doge", name: "Doge", src: "/placeholder.svg?height=400&width=400" },
  { id: "change-my-mind", name: "Change My Mind", src: "/placeholder.svg?height=400&width=600" },
  { id: "two-buttons", name: "Two Buttons", src: "/placeholder.svg?height=600&width=400" },
  { id: "expanding-brain", name: "Expanding Brain", src: "/placeholder.svg?height=800&width=600" },
]

const FONTS = [
  { id: "impact", name: "Impact", value: "Impact, sans-serif" },
  { id: "comic", name: "Comic Sans", value: "'Comic Sans MS', cursive" },
  { id: "arial", name: "Arial", value: "Arial, sans-serif" },
  { id: "times", name: "Times New Roman", value: "'Times New Roman', serif" },
]

export default function ImageMemeGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState(MEME_TEMPLATES[0])
  const [topText, setTopText] = useState("When you see a new slang term")
  const [bottomText, setBottomText] = useState("And your brain starts rotting")
  const [fontSize, setFontSize] = useState(36)
  const [fontFamily, setFontFamily] = useState(FONTS[0].value)
  const [textColor, setTextColor] = useState("#ffffff")
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate the meme whenever relevant state changes
  useEffect(() => {
    generateMeme()
  }, [selectedTemplate, topText, bottomText, fontSize, fontFamily, textColor, strokeColor, customImage])

  const handleTemplateChange = (templateId: string) => {
    const template = MEME_TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      setCustomImage(null)
    }
  }

  const handleFontChange = (fontId: string) => {
    const font = FONTS.find((f) => f.id === fontId)
    if (font) {
      setFontFamily(font.value)
    }
  }

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateMeme = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsGenerating(true)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Load image
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Configure text style
      ctx.font = `${fontSize}px ${fontFamily}`
      ctx.textAlign = "center"
      ctx.fillStyle = textColor
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = fontSize / 15

      // Draw top text
      if (topText) {
        const x = canvas.width / 2
        const y = fontSize + 10
        ctx.strokeText(topText.toUpperCase(), x, y)
        ctx.fillText(topText.toUpperCase(), x, y)
      }

      // Draw bottom text
      if (bottomText) {
        const x = canvas.width / 2
        const y = canvas.height - 20
        ctx.strokeText(bottomText.toUpperCase(), x, y)
        ctx.fillText(bottomText.toUpperCase(), x, y)
      }

      setIsGenerating(false)
    }

    img.src = customImage || selectedTemplate.src
  }

  const downloadMeme = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "brain-rot-meme.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
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
                <Label htmlFor="template">Choose Template</Label>
                <Select value={selectedTemplate.id} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEME_TEMPLATES.map((template) => (
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
                  Upload Custom Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCustomImageUpload}
                  className="hidden"
                />
              </div>

              <div>
                <Label htmlFor="topText">Top Text</Label>
                <Input
                  id="topText"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="Top text"
                />
              </div>

              <div>
                <Label htmlFor="bottomText">Bottom Text</Label>
                <Input
                  id="bottomText"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="Bottom text"
                />
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
                onClick={downloadMeme}
                className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Meme
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="sticky top-4">
          <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center mb-4">
            <canvas ref={canvasRef} className="max-w-full max-h-[500px] object-contain" />
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <RefreshCw className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 text-center">
            Preview your brain rot meme above. Click "Download Meme" to save it.
          </p>
        </div>
      </div>
    </div>
  )
}

