import Link from "next/link"
import { searchSlangTerms } from "@/lib/search"
import { linkSlangTerms } from "@/lib/link-slang-terms"
import { getPopularSlangTerms } from "@/lib/slang-terms"
import Header from "@/components/header"
import StickyVideo from "@/components/sticky-video"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, TrendingUp, Search } from "lucide-react"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ""
  const results = query ? await searchSlangTerms(query) : []
  const trendingTerms = await getPopularSlangTerms(5)

  // Group results by word
  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.word]) {
        acc[result.word] = []
      }
      acc[result.word].push(result)
      return acc
    },
    {} as Record<string, typeof results>,
  )

  // Pre-process linked definitions and examples
  const linkedDefinitionsPromises = results.map((result) => linkSlangTerms(result.definition))
  const linkedExamplesPromises = results.map((result) =>
    result.example ? linkSlangTerms(result.example) : Promise.resolve([]),
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
            {/* Search Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-bold text-purple-700">
                  <Search className="h-5 w-5 mr-2" />
                  Search Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {query ? (
                  <p className="text-gray-700">
                    {results.length > 0
                      ? `Found ${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`
                      : `No results found for "${query}"`}
                  </p>
                ) : (
                  <p className="text-gray-700">Enter a search term to find slang definitions</p>
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
                      <Link href={`/define/${term.word}`} className="text-blue-600 hover:underline">
                        {term.word}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Middle column - Search Results */}
          <div className="md:col-span-6">
            <h1 className="text-3xl font-bold mb-6 text-purple-800">Search Results</h1>

            {query ? (
              results.length > 0 ? (
                <div className="space-y-8">
                  {Object.entries(groupedResults).map(([word, wordResults]) => (
                    <div key={word} className="space-y-4">
                      <h3 className="text-2xl font-bold">
                        <Link href={`/define/${word}`} className="text-purple-700 hover:underline">
                          {word}
                        </Link>
                      </h3>

                      {wordResults.map((result, index) => {
                        const resultIndex = results.findIndex((r) => r.id === result.id)
                        return (
                          <Card key={result.id} className="overflow-hidden">
                            <CardContent className="p-6">
                              {result.match_type !== "word" && (
                                <div className="mb-4">
                                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                    Matched in {result.match_type}
                                  </Badge>
                                </div>
                              )}

                              <div className="text-gray-700 mb-4">
                                {resultIndex >= 0 ? linkedDefinitions[resultIndex] : result.definition}
                              </div>

                              {result.example && (
                                <div className="text-gray-600 italic mb-4">
                                  "
                                  {resultIndex >= 0 && linkedExamples[resultIndex]
                                    ? linkedExamples[resultIndex]
                                    : result.example}
                                  "
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1">
                                    <ThumbsUp className="h-4 w-4 text-gray-500" />
                                    <span>{result.upvotes}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ThumbsDown className="h-4 w-4 text-gray-500" />
                                    <span>{result.downvotes}</span>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                  by{" "}
                                  <Link href={`/user/${result.username}`} className="text-purple-600 hover:underline">
                                    {result.username}
                                  </Link>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-xl text-gray-500 mb-4">No slang terms found matching your search</p>
                  <p className="text-gray-500">Try a different search term or</p>
                  <p className="mt-2">
                    <Link href="/submit" className="text-purple-600 hover:underline">
                      Add a new definition
                    </Link>
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-xl text-gray-500 mb-4">Enter a search term to find slang definitions</p>
              </div>
            )}
          </div>

          {/* Right column - Sticky Video */}
          <div className="md:col-span-3">
            <StickyVideo videoType="minecraft" />
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

