import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import Header from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { linkSlangTerms } from "@/lib/link-slang-terms"
import type { Definition } from "@/lib/definitions"

async function getTagByName(tagName: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("tags").select("id, name").eq("name", tagName).single()

  if (error || !data) {
    return null
  }

  return data
}

async function getDefinitionsByTag(tagId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("definition_tags")
    .select(`
      definitions!inner (
        id, word, definition, example, upvotes, downvotes, created_at,
        users!inner (username)
      )
    `)
    .eq("tag_id", tagId)
    .order("definitions.upvotes", { ascending: false })

  if (error) {
    console.error("Error fetching definitions by tag:", error)
    return []
  }

  // Transform the data to match our Definition type
  return data.map((item) => ({
    ...item.definitions,
    username: item.definitions.users.username,
  })) as Definition[]
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tagName = decodeURIComponent(params.tag)
  const tag = await getTagByName(tagName)

  if (!tag) {
    notFound()
  }

  const definitions = await getDefinitionsByTag(tag.id)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Tag: {tag.name}</h1>
          </div>

          {definitions.length > 0 ? (
            <div className="space-y-6">
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
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="font-semibold text-green-600">{def.upvotes}</span> upvotes
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-red-600">{def.downvotes}</span> downvotes
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          by{" "}
                          <Link href={`/user/${def.username}`} className="hover:underline">
                            {def.username}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-xl text-gray-500 mb-4">No definitions found with this tag</p>
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

