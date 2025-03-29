import Header from "@/components/header"
import Link from "next/link"
import { getAllSlangTerms } from "@/lib/slang-terms"
import { Card, CardContent } from "@/components/ui/card"

export default async function StorePage() {
  const slangTerms = await getAllSlangTerms()

  // Get the top 12 terms by upvotes for featured products
  const featuredTerms = [...slangTerms].sort((a, b) => b.totalUpvotes - a.totalUpvotes).slice(0, 12)

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-white">Brain Rot Dictionary Store</h1>
          <p className="text-gray-300 mb-8">Get merch with your favorite slang terms!</p>

          <div className="bg-[#1D2439] p-6 rounded-lg mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredTerms.map((term) => (
                <Link key={term.word} href={`/store/${term.word}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-gray-800 border-gray-700">
                    <div className="aspect-square relative bg-gray-700">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{term.word}</span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-white">{term.word} Merch</h3>
                      <p className="text-gray-300 mt-1">$14.99</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#1D2439] p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-white">Product Categories</h2>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/store/category/mugs" className="hover:text-blue-300">
                    Mugs
                  </Link>
                </li>
                <li>
                  <Link href="/store/category/t-shirts" className="hover:text-blue-300">
                    T-Shirts
                  </Link>
                </li>
                <li>
                  <Link href="/store/category/hoodies" className="hover:text-blue-300">
                    Hoodies
                  </Link>
                </li>
                <li>
                  <Link href="/store/category/stickers" className="hover:text-blue-300">
                    Stickers
                  </Link>
                </li>
                <li>
                  <Link href="/store/category/posters" className="hover:text-blue-300">
                    Posters
                  </Link>
                </li>
              </ul>
            </div>

            <div className="bg-[#1D2439] p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-white">Custom Orders</h2>
              <p className="text-gray-300 mb-4">
                Want a product with a slang term that's not in our store yet? We can make it for you!
              </p>
              <Link href="/store/custom-order">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Request Custom Order
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#1D2439] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Shop</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/store/category/mugs" className="hover:underline">
                    Mugs
                  </Link>
                </li>
                <li>
                  <Link href="/store/category/t-shirts" className="hover:underline">
                    T-Shirts
                  </Link>
                </li>
                <li>
                  <Link href="/store/category/hoodies" className="hover:underline">
                    Hoodies
                  </Link>
                </li>
                <li>
                  <Link href="/store/category/stickers" className="hover:underline">
                    Stickers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/store/faq" className="hover:underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/store/shipping" className="hover:underline">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link href="/store/returns" className="hover:underline">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/store/contact" className="hover:underline">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">About</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:underline">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:underline">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:underline">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    TikTok
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} Brain Rot Dictionary. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

