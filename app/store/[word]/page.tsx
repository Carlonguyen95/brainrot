import { notFound } from "next/navigation"
import Header from "@/components/header"
import { getDefinitionsByWord } from "@/lib/definitions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart } from "lucide-react"

export default async function ProductPage({
  params,
}: {
  params: { word: string }
}) {
  const word = decodeURIComponent(params.word)
  const definitions = await getDefinitionsByWord(word)

  if (definitions.length === 0) {
    notFound()
  }

  // Get the first definition for display
  const definition = definitions[0]

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <nav className="flex mb-8 text-gray-300">
            <Link href="/store" className="hover:text-white">
              Store
            </Link>
            <span className="mx-2">/</span>
            <Link href="/store/category/mugs" className="hover:text-white">
              Mugs
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{word} Merch</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="aspect-square relative flex items-center justify-center bg-gray-700">
                <div className="text-4xl font-bold text-white">{word}</div>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">{word} Merch</h1>
              <div className="text-2xl font-bold mb-4 text-white">$14.99</div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2 text-white">Definition</h2>
                <p className="text-gray-300 mb-4">{definition.definition}</p>

                {definition.example && <div className="text-blue-300 italic mb-4">"{definition.example}"</div>}
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2 text-white">Product Details</h2>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Available as t-shirts, hoodies, mugs, and more</li>
                  <li>Premium quality materials</li>
                  <li>Print-on-demand technology</li>
                  <li>Definition included in the design</li>
                </ul>
              </div>

              <div className="flex gap-4 mb-8">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                  <Heart className="mr-2 h-4 w-4" />
                  Wishlist
                </Button>
              </div>

              <div className="text-gray-400 text-sm">Ships within 3-5 business days</div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-white">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {["rizz", "bussin", "cap", "sus"]
                .filter((w) => w !== word)
                .map((relatedWord) => (
                  <Link key={relatedWord} href={`/store/${relatedWord}`}>
                    <div className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square relative bg-gray-700 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{relatedWord}</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-white">{relatedWord} Merch</h3>
                        <p className="text-gray-300 mt-1">$14.99</p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
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

