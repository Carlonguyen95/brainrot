import { getRandomDefinitions } from "@/lib/definitions"
import { getUserVote } from "@/lib/votes"
import { linkSlangTerms } from "@/lib/link-slang-terms"
import { getPopularSlangTerms } from "@/lib/slang-terms"
import Header from "@/components/header"
import StickyVideo from "@/components/sticky-video"
import DefinitionCard from "@/components/definition-card"
import RefreshButton from "./refresh-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, TrendingUp } from "lucide-react"
import Link from "next/link"
import FlagBanner from "@/components/ads/flag-banner"
import { AD_CONFIG } from "@/lib/ad-config"

export default async function RandomPage({
  searchParams,
}: {
  searchParams: { t?: string }
}) {
  const randomDefinitions = await getRandomDefinitions(7)
  const trendingTerms = await getPopularSlangTerms(5)

  // Use the server-side configuration
  const useGoogleAds = AD_CONFIG.useGoogleAds

  // Get user votes for all definitions
  const userVotesPromises = randomDefinitions.map((def) => getUserVote(def.id))
  const userVotes = await Promise.all(userVotesPromises)

  // Pre-process linked definitions and examples
  const linkedDefinitionsPromises = randomDefinitions.map((def) => linkSlangTerms(def.definition))
  const linkedExamplesPromises = randomDefinitions.map((def) =>
    def.example ? linkSlangTerms(def.example) : Promise.resolve([]),
  )

  const linkedDefinitions = await Promise.all(linkedDefinitionsPromises)
  const linkedExamples = await Promise.all(linkedExamplesPromises)

  return (
    <div className="min-h-screen bg-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left column */}
          <div className="md:col-span-3 space-y-6">
            {/* Word of the Day */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-bold text-purple-700">
                  <Trophy className="h-5 w-5 mr-2" />
                  Random Words
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Discover new slang terms with our random selection. Refresh to see more!
                </p>
                <RefreshButton useGoogleAds={useGoogleAds} />
              </CardContent>
            </Card>

            {/* Trending */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-bold text-purple-700">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {trendingTerms.map((term) => (
                    <li key={term.word} className="flex items-center">
                      <span className="text-gray-400 mr-2">★</span>
                      <Link
                        href={`/define/${term.word}${useGoogleAds ? "?ads=google" : ""}`}
                        className="text-blue-600 hover:underline"
                      >
                        {term.word}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Middle column - Definitions */}
          <div className="md:col-span-6">
            <FlagBanner useGoogleAds={useGoogleAds} />

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-purple-800">Random Definitions</h1>
            </div>

            <div className="space-y-6">
              {randomDefinitions.map((def, index) => (
                <DefinitionCard
                  key={def.id}
                  id={def.id}
                  word={def.word}
                  definition={def.definition}
                  example={def.example}
                  username={def.username || "anonymous"}
                  date={new Date(def.created_at).toLocaleDateString()}
                  upvotes={def.upvotes}
                  downvotes={def.downvotes}
                  tags={def.tags}
                  userVote={userVotes[index] as "upvote" | "downvote" | null}
                  linkedDefinition={linkedDefinitions[index]}
                  linkedExample={def.example ? linkedExamples[index] : undefined}
                />
              ))}

              <div className="flex justify-center mt-8">
                <RefreshButton useGoogleAds={useGoogleAds} />
              </div>
            </div>
          </div>

          {/* Right column - Sticky Video */}
          <div className="md:col-span-3">
            <StickyVideo videoType="subway" />
          </div>
        </div>
      </main>

      <footer className="bg-purple-700 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Brain Rot Dictionary. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}

