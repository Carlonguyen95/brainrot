"use client"

import { useState } from "react"
import { Menu, X, BookOpen, ShoppingBag, Megaphone, Shuffle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    closeMenu()
  }

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-white hover:bg-purple-600">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Menu</span>
      </Button>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeMenu} />}

      {/* Slide-in menu */}
      <div
        className={`fixed top-0 right-0 h-full w-4/5 max-w-xs bg-purple-800 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-purple-700">
          <h2 className="text-white font-bold text-lg">Menu</h2>
          <Button variant="ghost" size="icon" onClick={closeMenu} className="text-white hover:bg-purple-700">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => handleNavigation("/")}
                className="flex items-center w-full text-white py-2 hover:text-purple-200"
              >
                <BookOpen className="h-5 w-5 mr-3" />
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/browse")}
                className="flex items-center w-full text-white py-2 hover:text-purple-200"
              >
                <BookOpen className="h-5 w-5 mr-3" />
                Browse
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/store")}
                className="flex items-center w-full text-white py-2 hover:text-purple-200"
              >
                <ShoppingBag className="h-5 w-5 mr-3" />
                Store
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/advertise")}
                className="flex items-center w-full text-white py-2 hover:text-purple-200"
              >
                <Megaphone className="h-5 w-5 mr-3" />
                Advertise
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/what-is-brain-rot")}
                className="flex items-center w-full text-white py-2 hover:text-purple-200"
              >
                <BookOpen className="h-5 w-5 mr-3" />
                What is Brain Rot?
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/meme-generator")}
                className="flex items-center w-full text-white py-2 hover:text-purple-200"
              >
                <BookOpen className="h-5 w-5 mr-3" />
                Meme Generator
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/random")}
                className="flex items-center w-full text-white py-2 hover:text-purple-200"
              >
                <Shuffle className="h-5 w-5 mr-3" />
                Random
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/submit")}
                className="flex items-center w-full text-white py-2 hover:text-purple-200"
              >
                <Plus className="h-5 w-5 mr-3" />
                Add Definition
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

