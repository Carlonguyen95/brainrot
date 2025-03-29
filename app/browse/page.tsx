import Link from "next/link"
import { getAllSlangTerms } from "@/lib/slang-terms"
import Header from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function BrowsePage() {
  const slangTerms = await getAllSlangTerms()

  // Group terms by first letter
  const termsByLetter = slangTerms.reduce(
    (acc, term) => {
      const firstLetter = term.word.charAt(0).toUpperCase()
      if (!acc[firstLetter]) {
        acc[firstLetter] = []
      }
      acc[firstLetter].push(term)
      return acc
    },
    {} as Record<string, typeof slangTerms>,
  )

  // Get all letters that have terms
  const letters = Object.keys(termsByLetter).sort()

  // Get all letters of the alphabet
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Browse Slang Terms</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Jump to Letter</h2>
          <div className="flex flex-wrap gap-2">
            {alphabet.map((letter) => {
              const hasTerms = letters.includes(letter)
              return (
                <Link
                  key={letter}
                  href={hasTerms ? `#${letter}` : "#"}
                  className={`w-10 h-10 flex items-center justify-center rounded-full border ${
                    hasTerms
                      ? "bg-[#1D2439] text-white hover:bg-[#2A3452]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {letter}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="space-y-8">
          {letters.map((letter) => (
            <div key={letter} id={letter} className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 border-b pb-2">{letter}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {termsByLetter[letter].map((term) => (
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
            </div>
          ))}
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

