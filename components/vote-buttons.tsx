"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { voteOnDefinition } from "@/lib/votes"

type VoteButtonsProps = {
  definitionId: string
  initialUpvotes: number
  initialDownvotes: number
  initialUserVote: "upvote" | "downvote" | null
}

export default function VoteButtons({
  definitionId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
}: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(initialUserVote)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleVote(voteType: "upvote" | "downvote") {
    setIsLoading(true)

    const result = await voteOnDefinition(definitionId, voteType)

    if (result.error) {
      // If not logged in, redirect to login
      if (result.error.includes("logged in")) {
        router.push("/auth/login")
      }
      setIsLoading(false)
      return
    }

    // Update local state based on the action
    if (result.action === "added") {
      if (voteType === "upvote") {
        setUpvotes((prev) => prev + 1)
      } else {
        setDownvotes((prev) => prev + 1)
      }
      setUserVote(voteType)
    } else if (result.action === "removed") {
      if (voteType === "upvote") {
        setUpvotes((prev) => prev - 1)
      } else {
        setDownvotes((prev) => prev - 1)
      }
      setUserVote(null)
    } else if (result.action === "changed") {
      if (voteType === "upvote") {
        setUpvotes((prev) => prev + 1)
        setDownvotes((prev) => prev - 1)
      } else {
        setUpvotes((prev) => prev - 1)
        setDownvotes((prev) => prev + 1)
      }
      setUserVote(voteType)
    }

    setIsLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className={`rounded-full ${userVote === "upvote" ? "bg-green-50 border-green-200" : ""}`}
        onClick={() => handleVote("upvote")}
        disabled={isLoading}
      >
        <ThumbsUp className={`h-4 w-4 mr-1 ${userVote === "upvote" ? "text-green-600" : ""}`} />
        <span>{upvotes.toLocaleString()}</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={`rounded-full ${userVote === "downvote" ? "bg-red-50 border-red-200" : ""}`}
        onClick={() => handleVote("downvote")}
        disabled={isLoading}
      >
        <ThumbsDown className={`h-4 w-4 mr-1 ${userVote === "downvote" ? "text-red-600" : ""}`} />
        <span>{downvotes.toLocaleString()}</span>
      </Button>
    </div>
  )
}

