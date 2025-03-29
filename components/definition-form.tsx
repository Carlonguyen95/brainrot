"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createDefinition } from "@/lib/definitions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

type DefinitionFormProps = {
  initialWord?: string
}

export default function DefinitionForm({ initialWord = "" }: DefinitionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await createDefinition(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    // Redirect to the word's page
    const word = (formData.get("word") as string).toLowerCase()
    router.push(`/define/${encodeURIComponent(word)}`)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a Definition</CardTitle>
        <CardDescription>Add your own slang term to the Brain Rot Dictionary</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="definition-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="word">Word or Phrase</Label>
            <Input id="word" name="word" required defaultValue={initialWord} placeholder="e.g., rizz, bussin, no cap" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="definition">Definition</Label>
            <Textarea
              id="definition"
              name="definition"
              required
              placeholder="What does this term mean?"
              className="min-h-24"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="example">Example (optional)</Label>
            <Textarea id="example" name="example" placeholder="Use it in a sentence" className="min-h-20" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" name="tags" placeholder="e.g., slang, gen-z, internet" />
            <p className="text-sm text-muted-foreground">Add relevant tags to help others find this definition</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="definition-form" disabled={isLoading} className="w-full">
          {isLoading ? "Submitting..." : "Submit Definition"}
        </Button>
      </CardFooter>
    </Card>
  )
}

