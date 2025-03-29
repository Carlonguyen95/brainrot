"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { getBrowserClient } from "@/lib/supabase"
import Header from "@/components/header"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { linkSlangTerms } from "@/lib/link-slang-terms"
import type { Definition } from "@/lib/definitions"

export default function MyDefinitionsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [loadingDefinitions, setLoadingDefinitions] = useState(true)

  useEffect(() => {
    // Redirect to login if user is not authenticated and not still loading
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function fetchUserDefinitions() {
      if (!user) return

      setLoadingDefinitions(true)
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
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching user definitions:", error)
          setDefinitions([])
        } else {
          // Transform the data to match our Definition type
          const transformedData = data.map((item) => ({
            ...item,
            username: user.username,
            tags: item.definition_tags.map((dt: any) => dt.tags.name),
          })) as Definition[]

          setDefinitions(transformedData)
        }
      } catch (err) {
        console.error("Error in fetchUserDefinitions:", err)
        setDefinitions([])
      } finally {
        setLoadingDefinitions(false)
      }
    }

    if (user) {
      fetchUserDefinitions()
    }
  }, [user])

  // Show loading state while checking authentication
  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Definitions</h1>
            <Link href="/submit">
              <Button>Add New Definition</Button>
            </Link>
          </div>

          {loadingDefinitions ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Loading your definitions...</p>
            </div>
          ) : definitions.length > 0 ? (
            <div className="space-y-4">
              {definitions.map((def) => (
                <Card key={def.id} className="border-2 border-gray-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <Link href={`/define/${def.word}`} className="text-2xl font-bold hover:underline text-blue-600">
                          {def.word}
                        </Link>
                      </div>

                      <div className="text-lg">
                        <p>{linkSlangTerms(def.definition)}</p>
                      </div>

                      {def.example && (
                        <div className="text-gray-600 italic">
                          <p>"{linkSlangTerms(def.example)}"</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-gray-500">
                          Added on {new Date(def.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/edit-definition/${def.id}`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Link href={`/delete-definition/${def.id}`}>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 px-6 py-3">
                    <div className="flex justify-between w-full text-sm">
                      <div>
                        <span className="font-semibold">{def.upvotes}</span> upvotes
                      </div>
                      <div>
                        <span className="font-semibold">{def.downvotes}</span> downvotes
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-xl text-gray-500 mb-4">You haven't added any definitions yet</p>
              <Link href="/submit">
                <Button>Add Your First Definition</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-[#1D2439] text-white py-8 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Brain Rot Dictionary. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}

