import Link from "next/link"
import { getSlangTermsByLetter } from "@/lib/slang-terms"
import Header from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function BrowseByLetterPage({ params }: { params: { letter: string } }) {
  const letter = params.letter.toLowerCase()
  const slangTerms = await getSlangTermsByLetter(letter)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/browse">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Browse
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Slang Terms: {letter.toUpperCase()}</h1>
        </div>

        {slangTerms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slangTerms.map((term) => (
              <Link key={term.word} href={`/define/${term.word}`}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="font-bold text-lg text-blue-600">{term.word}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {term.definitionCount} definition{term.definitionCount !== 1 ? "s" : ""}
                      </Badge>
                      <Badge variant="outline">
                        {term.totalUpvotes} upvote{term.totalUpvotes !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 mb-4">No slang terms found starting with '{letter.toUpperCase()}'</p>
            <p>
              <Link href="/submit" className="text-blue-600 hover:underline">
                Be the first to add one!
              </Link>
            </p>
          </div>
        )}
      </main>

      <footer className="bg-[#1D2439] text-white py-8 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Brain Rot Dictionary. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}

