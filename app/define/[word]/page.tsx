import { notFound } from "next/navigation"
import Link from "next/link"
import { getDefinitionsByWord, getRelatedWords } from "@/lib/definitions"
import { getUserVote } from "@/lib/votes"
import { linkSlangTerms } from "@/lib/link-slang-terms"
import { getPopularSlangTerms } from "@/lib/slang-terms"
import Header from "@/components/header"
import StickyVideo from "@/components/sticky-video"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, Share2, Trophy, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import BannerAd from "@/components/ads/banner-ad"
import StickyPoleAd from "@/components/ads/sticky-pole-ad"
import FlagBanner from "@/components/ads/flag-banner"
import { AD_CONFIG } from "@/lib/ad-config"

export default async function DefinitionPage({
  params,
}: {
  params: { word: string }
}) {
  const word = decodeURIComponent(params.word)
  const definitions = await getDefinitionsByWord(word)

  // Use the server-side configuration
  const useGoogleAds = AD_CONFIG.useGoogleAds

  if (definitions.length === 0) {
    notFound()
  }

  // Get user votes for all definitions
  const userVotesPromises = definitions.map((def) => getUserVote(def.id))
  const userVotes = await Promise.all(userVotesPromises)

  // Get related words - handle errors gracefully
  let relatedWords: string[] = []
  try {
    relatedWords = await getRelatedWords(word)
  } catch (error) {
    console.error(`Error fetching related words for ${word}:`, error)
    // Continue with empty related words
  }

  // Get trending terms for the left sidebar
  const trendingTerms = await getPopularSlangTerms(5)

  // Pre-process linked definitions and examples
  const linkedDefinitionsPromises = definitions.map((def) => linkSlangTerms(def.definition))
  const linkedExamplesPromises = definitions.map((def) =>
    def.example ? linkSlangTerms(def.example) : Promise.resolve([]),
  )

  const linkedDefinitions = await Promise.all(linkedDefinitionsPromises)
  const linkedExamples = await Promise.all(linkedExamplesPromises)

  return (
    <div className="min-h-screen bg-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left column - Same as home page */}
          <div className="md:col-span-3 space-y-6">
            {/* Word of the Day */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-bold text-purple-700">
                  <Trophy className="h-5 w-5 mr-2" />
                  Related Words
                </CardTitle>
              </CardHeader>
              <CardContent>
                {relatedWords.length > 0 ? (
                  <ul className="space-y-2">
                    {relatedWords.map((relatedWord) => (
                      <li key={relatedWord} className="flex items-center">
                        <span className="text-gray-400 mr-2">★</span>
                        <Link
                          href={`/define/${relatedWord}${useGoogleAds ? "?ads=google" : ""}`}
                          className="text-blue-600 hover:underline"
                        >
                          {relatedWord}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No related words found.</p>
                )}
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

          {/* Middle column - Definitions (same position as home page) */}
          <div className="md:col-span-6">
            <FlagBanner useGoogleAds={useGoogleAds} />

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-purple-800">{word}</h1>
            </div>

            <div className="space-y-6">
              {definitions.map((def, index) => (
                <>
                  <Card key={def.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1"></div>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-700">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-lg text-gray-700 mb-4">{linkedDefinitions[index]}</div>

                      {def.example && linkedExamples[index] && (
                        <div className="text-gray-600 italic mb-4">"{linkedExamples[index]}"</div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <ThumbsUp
                              className={`h-4 w-4 ${userVotes[index] === "upvote" ? "text-green-600" : "text-gray-500"}`}
                            />
                            <span>{def.upvotes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsDown
                              className={`h-4 w-4 ${userVotes[index] === "downvote" ? "text-red-600" : "text-gray-500"}`}
                            />
                            <span>{def.downvotes}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          by{" "}
                          <Link href={`/user/${def.username}`} className="text-purple-600 hover:underline">
                            {def.username}
                          </Link>{" "}
                          on {new Date(def.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                    <Link
                      href={`/store/${word}`}
                      className="block bg-purple-600 text-white text-center py-3 font-medium hover:bg-purple-700 transition-colors"
                    >
                      Get {word} merch
                    </Link>
                  </Card>

                  {/* Insert banner ad after every 2 definitions */}
                  {(index + 1) % 2 === 0 && index < definitions.length - 1 && (
                    <BannerAd key={`ad-${index}`} index={Math.floor(index / 2)} useGoogleAds={useGoogleAds} />
                  )}
                </>
              ))}
            </div>
          </div>

          {/* Right column - Sticky Video (same as home page) */}
          <div className="md:col-span-3">
            <StickyVideo videoType="subway" />
          </div>
        </div>
      </main>

      {/* Sticky Pole Ad */}
      <StickyPoleAd useGoogleAds={useGoogleAds} />

      <footer className="bg-purple-700 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Brain Rot Dictionary. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}

