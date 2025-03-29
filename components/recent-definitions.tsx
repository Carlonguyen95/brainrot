import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { linkSlangTerms } from "@/lib/link-slang-terms"
import VoteButtons from "@/components/vote-buttons"
import { getUserVote } from "@/lib/votes"
import type { Definition } from "@/lib/definitions"

type RecentDefinitionsProps = {
  definitions: Definition[]
}

export default async function RecentDefinitions({ definitions }: RecentDefinitionsProps) {
  // Get user votes for all definitions
  const userVotesPromises = definitions.map((def) => getUserVote(def.id))
  const userVotes = await Promise.all(userVotesPromises)

  return (
    <Card>
      <CardHeader className="bg-[#1D2439] text-white rounded-t-lg">
        <CardTitle className="text-xl">Recent Brain Rot Definitions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {definitions.length > 0 ? (
            definitions.map((def, index) => (
              <div key={def.id}>
                <div className="space-y-4">
                  <div>
                    <Link href={`/define/${def.word}`} className="text-2xl font-bold hover:underline text-blue-600">
                      {def.word}
                    </Link>
                  </div>

                  <div>
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
                      by{" "}
                      <Link href={`/user/${def.username}`} className="text-blue-600 hover:underline">
                        {def.username || "anonymous"}
                      </Link>{" "}
                      on {new Date(def.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {index < definitions.length - 1 && <Separator className="my-6" />}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No definitions yet. Be the first to add one!</p>
              <Link href="/submit">
                <Button className="mt-4">Submit Definition</Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

