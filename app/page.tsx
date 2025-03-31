import Link from "next/link";
import { getRecentDefinitions } from "@/lib/definitions";
import { getPopularSlangTerms } from "@/lib/slang-terms";
import { getUserVote } from "@/lib/votes";
import { linkSlangTerms } from "@/lib/link-slang-terms";
import { getTodaysWordOfTheDay } from "@/lib/actions/wotd-actions";
import Header from "@/components/header";
import StickyVideo from "@/components/sticky-video";
import CatSticky from "@/components/cat-sticky";
import DefinitionCard from "@/components/definition-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/pagination";
import BannerAd from "@/components/ads/banner-ad";
import StickyPoleAd from "@/components/ads/sticky-pole-ad";
import FlagBanner from "@/components/ads/flag-banner";
import { AD_CONFIG } from "@/lib/ad-config";

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 7;
  const totalDefinitions = 100; // This would ideally come from a count query
  const totalPages = Math.ceil(totalDefinitions / pageSize);

  // Use the server-side configuration
  const useGoogleAds = AD_CONFIG.useGoogleAds;

  const recentDefinitions = await getRecentDefinitions(
    pageSize,
    (currentPage - 1) * pageSize
  );
  const trendingTerms = await getPopularSlangTerms(5);
  const wordOfTheDay = await getTodaysWordOfTheDay();

  // Get user votes for all definitions
  const userVotesPromises = recentDefinitions.map((def) => getUserVote(def.id));
  const userVotes = await Promise.all(userVotesPromises);

  // Pre-process linked definitions and examples
  const linkedDefinitionsPromises = recentDefinitions.map((def) =>
    linkSlangTerms(def.definition)
  );
  const linkedExamplesPromises = recentDefinitions.map((def) =>
    def.example ? linkSlangTerms(def.example) : Promise.resolve([])
  );

  const linkedDefinitions = await Promise.all(linkedDefinitionsPromises);
  const linkedExamples = await Promise.all(linkedExamplesPromises);

  // Get linked content for Word of the Day
  const wordOfTheDayLinkedDef = wordOfTheDay?.definition
    ? await linkSlangTerms(wordOfTheDay.definition.definition)
    : [];
  const wordOfTheDayLinkedExample = wordOfTheDay?.definition?.example
    ? await linkSlangTerms(wordOfTheDay.definition.example)
    : [];

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
                  Word of the Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                {wordOfTheDay?.definition ? (
                  <div>
                    <Link
                      href={`/define/${wordOfTheDay.definition.word}`}
                      className="text-xl font-bold text-blue-600 hover:underline"
                    >
                      {wordOfTheDay.definition.word}
                    </Link>
                    <p className="mt-2 text-gray-700">
                      {wordOfTheDayLinkedDef}
                    </p>
                    {wordOfTheDay.definition.example && (
                      <p className="mt-2 text-gray-500 italic">
                        "{wordOfTheDayLinkedExample}"
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No word of the day available yet.
                  </p>
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
                        href={`/define/${term.word}`}
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
          <div className="md:col-span-6 space-y-6">
            <FlagBanner useGoogleAds={useGoogleAds} />
            {recentDefinitions.map((def, index) => (
              <div key={def.id}>
                <DefinitionCard
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
                  linkedExample={
                    def.example ? linkedExamples[index] : undefined
                  }
                />

                {/* Insert banner ad after every 2 cards */}
                {(index + 1) % 2 === 0 &&
                  index < recentDefinitions.length - 1 && (
                    <BannerAd
                      key={`ad-${index}`}
                      index={Math.floor(index / 2)}
                      useGoogleAds={useGoogleAds}
                    />
                  )}
              </div>
            ))}

            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={"/"}
              />

              <div className="mt-6 text-center">
                <Link href={"/random"}>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    More Random Definitions
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right column - Sticky Video and Cat */}
          <div className="md:col-span-3 space-y-4">
            <StickyVideo videoType="minecraft" />
            <CatSticky />
          </div>
        </div>
      </main>

      {/* Sticky Pole Ad */}
      {/*       <StickyPoleAd useGoogleAds={useGoogleAds} />
       */}
      <footer className="bg-purple-700 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>
            © {new Date().getFullYear()} Brain Rot Dictionary. All Rights
            Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
