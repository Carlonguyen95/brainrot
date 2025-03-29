"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/define/${encodeURIComponent(searchTerm.trim())}`)
    }
  }

//   return (
//     <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
//       <div className="relative">
//         <Input
//           type="text"
//           placeholder="Search for a word..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full pl-4 pr-12 py-2 bg-white text-black rounded-full"
//         />
//         <Button
//           type="submit"
//           size="icon"
//           className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#1D2439]"
//         >
//           <Search className="h-4 w-4" />
//           <span className="sr-only">Search</span>
//         </Button>
//       </div>
//     </form>
//   )
// }

return (
  <div className="relative w-full max-w-md">
    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
    <Input
      type="search"
      placeholder="Search..."
      className="w-full pl-8 text-black" // Changed text color to black
      value={query}
      onChange={handleSearch}
    />
  </div>
)
}