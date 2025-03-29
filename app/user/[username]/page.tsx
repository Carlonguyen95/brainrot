import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import Header from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserVote } from "@/lib/votes"
import { linkSlangTerms } from "@/lib/link-slang-terms"
import VoteButtons from "@/components/vote-buttons"
import type { Definition } from "@/lib/definitions"

async function getUserByUsername(username: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("users")
    .select("id, username, avatar_url, bio")
    .eq("username", username)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

async function getUserDefinitions(userId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("definitions")
    .select(`
      *,
      definition_tags!inner (
        tags:tag_id (name)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user definitions:", error)
    return []
  }

  // Transform the data to match our Definition type
  return data.map((item) => ({
    ...item,
    username: undefined, // We already know the username
    tags: item.definition_tags.map((dt: any) => dt.tags.name),
  })) as Definition[]
}

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username)
  const user = await getUserByUsername(username)

  if (!user) {
    notFound()
  }

  const definitions = await getUserDefinitions(user.id)

  // Get user votes for all definitions
  const userVotesPromises = definitions.map((def) => getUserVote(def.id))
  const userVotes = await Promise.all(userVotesPromises)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.avatar_url || ""} alt={user.username} />
                  <AvatarFallback className="text-2xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-2xl font-bold mb-2">{user.username}</h1>
                  {user.bio && <p className="text-gray-600 mb-4">{user.bio}</p>}
                  <div className="flex gap-4">
                    <div className="text-sm">
                      <span className="font-bold">{definitions.length}</span> definitions
                    </div>
                    <div className="text-sm">
                      <span className="font-bold">{definitions.reduce((sum, def) => sum + def.upvotes, 0)}</span>{" "}
                      upvotes received
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-bold mb-4">Definitions by {user.username}</h2>

          {definitions.length > 0 ? (
            <div className="space-y-4">
              {definitions.map((def, index) => (
                <Card key={def.id} className="border-2 border-gray-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <Link href={`/define/${def.word}`} className="text-2xl font-bold hover:underline text-blue-600">
                          {def.word}
                        </Link>
                        <div className="flex gap-2 mt-1">
                          {def.tags?.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="text-lg">
                        <p>{linkSlangTerms(def.definition)}</p>
                      </div>

                      {def.example && (
                        <div className="text-gray-600 italic">
                          <p>"{linkSlangTerms(def.example)}"</p>
                        </div>
                      )}

                      <div className="flex items-center gap-6 pt-2">
                        <VoteButtons
                          definitionId={def.id}
                          initialUpvotes={def.upvotes}
                          initialDownvotes={def.downvotes}
                          initialUserVote={userVotes[index] as "upvote" | "downvote" | null}
                        />
                        <div className="text-sm text-gray-500">
                          Added on {new Date(def.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No definitions yet.</p>
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

