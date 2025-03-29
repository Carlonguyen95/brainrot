import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { linkSlangTerms } from "@/lib/link-slang-terms"
import { getUserVote } from "@/lib/votes"
import VoteButtons from "@/components/vote-buttons"
import type { Definition } from "@/lib/definitions"

type WordOfTheDayProps = {
  definition: Definition
}

export default async function WordOfTheDay({ definition }: WordOfTheDayProps) {
  const userVote = await getUserVote(definition.id)
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card>
      <CardHeader className="bg-[#1D2439] text-white rounded-t-lg">
        <CardTitle className="text-xl">Brain Rot Word of the Day - {today}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <Link href={`/define/${definition.word}`} className="text-3xl font-bold hover:underline text-blue-600">
              {definition.word}
            </Link>
          </div>

          <div className="text-lg">
            <p>{linkSlangTerms(definition.definition)}</p>
          </div>

          {definition.example && (
            <div className="text-gray-600 italic">
              <p>{linkSlangTerms(definition.example)}</p>
            </div>
          )}

          <div className="flex items-center gap-6 pt-2">
            <VoteButtons
              definitionId={definition.id}
              initialUpvotes={definition.upvotes}
              initialDownvotes={definition.downvotes}
              initialUserVote={userVote as "upvote" | "downvote" | null}
            />
            <div className="text-sm text-gray-500">
              by{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                {definition.username || "anonymous"}
              </Link>{" "}
              on {new Date(definition.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

