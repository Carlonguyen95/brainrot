"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Plus, BookOpen, ShoppingBag, Megaphone } from "lucide-react"
import SearchForm from "@/components/search-form"
import MobileMenu from "@/components/mobile-menu"
import { useMobile } from "@/hooks/use-mobile"

export default function Header() {
  const { user, isLoading, error } = useAuth()
  const router = useRouter()
  const isMobile = useMobile()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error("Error signing out:", err)
      // Fallback to client-side navigation if server action fails
      router.push("/")
      router.refresh()
    }
  }

  return (
    <header className="bg-purple-700 text-white">
      {/* Upper section */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span className="text-xl font-bold">Brain Rot Dictionary</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/browse" className="hover:text-purple-200">
                Browse
              </Link>
              <Link href="/store" className="hover:text-purple-200 flex items-center">
                <ShoppingBag className="h-4 w-4 mr-1" />
                Store
              </Link>
              <Link href="/advertise" className="hover:text-purple-200 flex items-center">
                <Megaphone className="h-4 w-4 mr-1" />
                Advertise
              </Link>
              <Link href="/what-is-brain-rot" className="hover:text-purple-200">
                What is Brain Rot?
              </Link>
              <Link href="/meme-generator" className="hover:text-purple-200">
                Brainrotify
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {error ? (
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-purple-600 bg-transparent"
                onClick={() => router.push("/auth/login")}
              >
                Sign In
              </Button>
            ) : isLoading ? (
              <div className="w-8 h-8 rounded-full bg-purple-600 animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-600">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar_url || ""} alt={user.username} />
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/my-definitions")}>
                    <span>My Definitions</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/store/admin")}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>Store Admin</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-purple-600 bg-transparent"
                onClick={() => router.push("/auth/login")}
              >
                Sign In
              </Button>
            )}

            {!isMobile && (
              <Button
                onClick={() => router.push("/submit")}
                className="bg-purple-500 hover:bg-purple-600 text-white rounded-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Define New Word
              </Button>
            )}

            <MobileMenu />
          </div>
        </div>
      </div>

      {/* Search bar section */}
      <div className="bg-purple-50 py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <SearchForm
              variant="minimal"
              className="w-full"
              placeholder="What's rotting your brain today?"
              showRandomButton={true}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

