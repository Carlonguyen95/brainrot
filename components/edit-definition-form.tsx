"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Definition } from "@/lib/definitions"

type EditDefinitionFormProps = {
  definition: Definition
}

export default function EditDefinitionForm({ definition }: EditDefinitionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData(event.currentTarget)
      const definitionText = formData.get("definition") as string
      const example = formData.get("example") as string

      const supabase = getBrowserClient()

      // Update definition
      const { error: updateError } = await supabase
        .from("definitions")
        .update({
          definition: definitionText,
          example,
          updated_at: new Date().toISOString(),
        })
        .eq("id", definition.id)

      if (updateError) {
        setError(updateError.message)
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setIsLoading(false)

      // Refresh the page data
      router.refresh()

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/define/${definition.word}`)
      }, 1500)
    } catch (err) {
      console.error("Error updating definition:", err)
      setError("An error occurred while updating the definition")
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-600">
              Definition updated successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        <form id="edit-definition-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="word">Word or Phrase</Label>
            <Input id="word" name="word" defaultValue={definition.word} disabled className="bg-gray-50" />
            <p className="text-sm text-muted-foreground">
              The word cannot be changed. If you want to define a different word, please create a new definition.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="definition">Definition</Label>
            <Textarea
              id="definition"
              name="definition"
              required
              defaultValue={definition.definition}
              className="min-h-24"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="example">Example (optional)</Label>
            <Textarea id="example" name="example" defaultValue={definition.example || ""} className="min-h-20" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Current Tags</Label>
            <Input id="tags" name="tags" defaultValue={definition.tags?.join(", ")} disabled className="bg-gray-50" />
            <p className="text-sm text-muted-foreground">Tags cannot be changed at this time.</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" form="edit-definition-form" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}

