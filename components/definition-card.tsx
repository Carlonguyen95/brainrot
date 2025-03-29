"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ThumbsUp, ThumbsDown, Share2, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getBrowserClient } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"

interface DefinitionProps {
  id: string
  word: string
  definition: string
  example?: string | null
  username: string
  date: string
  upvotes: number
  downvotes: number
  tags?: string[]
  userVote?: "upvote" | "downvote" | null
  linkedDefinition: React.ReactNode[]
  linkedExample?: React.ReactNode[]
}

const DefinitionCard: React.FC<DefinitionProps> = ({
  id,
  word,
  definition,
  example,
  username,
  date,
  upvotes,
  downvotes,
  tags,
  userVote: initialUserVote,
  linkedDefinition,
  linkedExample,
}) => {
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(initialUserVote || null)
  const [upvoteCount, setUpvoteCount] = useState(upvotes)
  const [downvoteCount, setDownvoteCount] = useState(downvotes)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  async function handleVote(voteType: "upvote" | "downvote") {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsLoading(true)
    try {
      const supabase = getBrowserClient()

      // Check if user has already voted on this definition
      const { data: existingVote } = await supabase
        .from("votes")
        .select("id, vote_type")
        .eq("user_id", user.id)
        .eq("definition_id", id)
        .single()

      if (existingVote) {
        // User already voted, check if they're changing their vote
        if (existingVote.vote_type === voteType) {
          // Remove the vote
          await supabase.from("votes").delete().eq("id", existingVote.id)

          // Update local state
          if (voteType === "upvote") {
            setUpvoteCount((prev) => prev - 1)
          } else {
            setDownvoteCount((prev) => prev - 1)
          }
          setUserVote(null)
        } else {
          // Change vote type
          await supabase.from("votes").update({ vote_type: voteType }).eq("id", existingVote.id)

          // Update local state
          if (voteType === "upvote") {
            setUpvoteCount((prev) => prev + 1)
            setDownvoteCount((prev) => prev - 1)
          } else {
            setUpvoteCount((prev) => prev - 1)
            setDownvoteCount((prev) => prev + 1)
          }
          setUserVote(voteType)
        }
      } else {
        // New vote
        await supabase.from("votes").insert({
          user_id: user.id,
          definition_id: id,
          vote_type: voteType,
        })

        // Update local state
        if (voteType === "upvote") {
          setUpvoteCount((prev) => prev + 1)
        } else {
          setDownvoteCount((prev) => prev + 1)
        }
        setUserVote(voteType)
      }

      // Update definition vote counts in the database
      await supabase
        .from("definitions")
        .update({
          upvotes: voteType === "upvote" ? upvoteCount + 1 : upvoteCount - (userVote === "upvote" ? 1 : 0),
          downvotes: voteType === "downvote" ? downvoteCount + 1 : downvoteCount - (userVote === "downvote" ? 1 : 0),
        })
        .eq("id", id)
    } catch (error) {
      console.error("Error voting:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator
        .share({
          title: `${word} - Brain Rot Dictionary`,
          text: `Check out the definition of "${word}" on Brain Rot Dictionary`,
          url: `${window.location.origin}/define/${word}`,
        })
        .catch((err) => console.error("Error sharing:", err))
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard
        .writeText(`${window.location.origin}/define/${word}`)
        .then(() => alert("Link copied to clipboard!"))
        .catch((err) => console.error("Error copying to clipboard:", err))
    }
  }

  function handleFlag() {
    if (!user) {
      router.push("/auth/login")
      return
    }

    alert("Thank you for flagging this definition. Our moderators will review it.")
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Link href={`/define/${word}`} className="text-2xl font-bold text-purple-700 hover:underline">
            {word}
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-700" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600" onClick={handleFlag}>
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-gray-700 mb-4">{linkedDefinition}</div>

        {example && linkedExample && <div className="text-gray-600 italic mb-4">"{linkedExample}"</div>}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleVote("upvote")}
              disabled={isLoading}
              className={`flex items-center gap-1 ${userVote === "upvote" ? "text-green-600" : "text-gray-500 hover:text-green-600"}`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{upvoteCount}</span>
            </button>
            <button
              onClick={() => handleVote("downvote")}
              disabled={isLoading}
              className={`flex items-center gap-1 ${userVote === "downvote" ? "text-red-600" : "text-gray-500 hover:text-red-600"}`}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{downvoteCount}</span>
            </button>
          </div>
          <div className="text-sm text-gray-500">
            by{" "}
            <Link href={`/user/${username}`} className="text-purple-600 hover:underline">
              {username}
            </Link>{" "}
            on {date}
          </div>
        </div>
      </div>

      <Link
        href={`/store/${word}`}
        className="block bg-purple-600 text-white text-center py-3 font-medium hover:bg-purple-700 transition-colors"
      >
        Get {word} merch
      </Link>
    </div>
  )
}

export default DefinitionCard

