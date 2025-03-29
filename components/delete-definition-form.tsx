"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { linkSlangTerms } from "@/lib/link-slang-terms"
import type { Definition } from "@/lib/definitions"

type DeleteDefinitionFormProps = {
  definition: Definition
}

export default function DeleteDefinitionForm({ definition }: DeleteDefinitionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete() {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getBrowserClient()

      // Delete definition (cascade will handle definition_tags)
      const { error: deleteError } = await supabase.from("definitions").delete().eq("id", definition.id)

      if (deleteError) {
        setError(deleteError.message)
        setIsLoading(false)
        return
      }

      // Redirect to my definitions page
      router.push("/my-definitions")
      router.refresh()
    } catch (err) {
      console.error("Error deleting definition:", err)
      setError("An error occurred while deleting the definition")
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertDescription className="text-red-600">
            Are you sure you want to delete this definition? This action cannot be undone.
          </AlertDescription>
        </Alert>

        <div className="border-2 border-gray-200 rounded-lg p-4 mb-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-blue-600">{definition.word}</h2>
              <div className="flex gap-2 mt-1">
                {definition.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-lg">
              <p>{linkSlangTerms(definition.definition)}</p>
            </div>

            {definition.example && (
              <div className="text-gray-600 italic">
                <p>"{linkSlangTerms(definition.example)}"</p>
              </div>
            )}

            <div className="text-sm text-gray-500">Added on {new Date(definition.created_at).toLocaleDateString()}</div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
          {isLoading ? "Deleting..." : "Delete Definition"}
        </Button>
      </CardFooter>
    </Card>
  )
}

