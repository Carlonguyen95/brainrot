"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { getBrowserClient } from "@/lib/supabase"
import Header from "@/components/header"
import DeleteDefinitionForm from "@/components/delete-definition-form"
import type { Definition } from "@/lib/definitions"

export default function DeleteDefinitionPage({ params }: { params: { id: string } }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [definition, setDefinition] = useState<Definition | null>(null)
  const [loadingDefinition, setLoadingDefinition] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect to login if user is not authenticated and not still loading
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function fetchDefinition() {
      if (!user) return

      setLoadingDefinition(true)
      try {
        const supabase = getBrowserClient()

        const { data, error } = await supabase
          .from("definitions")
          .select(`
            *,
            definition_tags!inner (
              tags:tag_id (name)
            )
          `)
          .eq("id", params.id)
          .single()

        if (error || !data) {
          console.error("Error fetching definition:", error)
          setError("Definition not found")
          setDefinition(null)
          return
        }

        // Check if user owns this definition
        if (data.user_id !== user.id) {
          setError("You don't have permission to delete this definition")
          setDefinition(null)
          return
        }

        // Transform the data to match our Definition type
        const transformedData = {
          ...data,
          username: user.username,
          tags: data.definition_tags.map((dt: any) => dt.tags.name),
        } as Definition

        setDefinition(transformedData)
        setError(null)
      } catch (err) {
        console.error("Error in fetchDefinition:", err)
        setError("An error occurred while fetching the definition")
        setDefinition(null)
      } finally {
        setLoadingDefinition(false)
      }
    }

    if (user) {
      fetchDefinition()
    }
  }, [user, params.id])

  // Show loading state while checking authentication
  if (isLoading || loadingDefinition) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container max-w-screen-xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render the content until we know the user is authenticated
  if (!user) {
    return null
  }

  // Show error message
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container max-w-screen-xl mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              <p>{error}</p>
              <button onClick={() => router.push("/my-definitions")} className="mt-4 text-sm underline">
                Back to My Definitions
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show form if definition is loaded
  if (definition) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container max-w-screen-xl mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Delete Definition</h1>
            <DeleteDefinitionForm definition={definition} />
          </div>
        </div>
      </div>
    )
  }

  return null
}

