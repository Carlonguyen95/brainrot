"use server"

import { createServerClient } from "./supabase"
import { getCurrentUser } from "./auth"

export async function voteOnDefinition(definitionId: string, voteType: "upvote" | "downvote") {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "You must be logged in to vote" }
  }

  const supabase = createServerClient()

  // Check if user has already voted on this definition
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id, vote_type")
    .eq("user_id", user.id)
    .eq("definition_id", definitionId)
    .single()

  // Start a transaction
  if (existingVote) {
    // User already voted, check if they're changing their vote
    if (existingVote.vote_type === voteType) {
      // Remove the vote
      await supabase.from("votes").delete().eq("id", existingVote.id)

      // Update definition vote counts
      if (voteType === "upvote") {
        await supabase.rpc("decrement_upvotes", { definition_id: definitionId })
      } else {
        await supabase.rpc("decrement_downvotes", { definition_id: definitionId })
      }

      return { success: true, action: "removed" }
    } else {
      // Change vote type
      await supabase.from("votes").update({ vote_type: voteType }).eq("id", existingVote.id)

      // Update definition vote counts
      if (voteType === "upvote") {
        await supabase.rpc("increment_upvotes", { definition_id: definitionId })
        await supabase.rpc("decrement_downvotes", { definition_id: definitionId })
      } else {
        await supabase.rpc("increment_downvotes", { definition_id: definitionId })
        await supabase.rpc("decrement_upvotes", { definition_id: definitionId })
      }

      return { success: true, action: "changed" }
    }
  } else {
    // New vote
    await supabase.from("votes").insert({
      user_id: user.id,
      definition_id: definitionId,
      vote_type: voteType,
    })

    // Update definition vote counts
    if (voteType === "upvote") {
      await supabase.rpc("increment_upvotes", { definition_id: definitionId })
    } else {
      await supabase.rpc("increment_downvotes", { definition_id: definitionId })
    }

    return { success: true, action: "added" }
  }
}

export async function getUserVote(definitionId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const supabase = createServerClient()

  const { data } = await supabase
    .from("votes")
    .select("vote_type")
    .eq("user_id", user.id)
    .eq("definition_id", definitionId)
    .single()

  return data ? data.vote_type : null
}

