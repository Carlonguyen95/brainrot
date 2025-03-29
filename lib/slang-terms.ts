"use server"

import { createServerClient } from "./supabase"

export type SlangTerm = {
  word: string
  definitionCount: number
  totalUpvotes: number
}

export async function getAllSlangTerms(): Promise<SlangTerm[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("definitions").select("word, upvotes").order("word")

  if (error) {
    console.error("Error fetching slang terms:", error)
    return []
  }

  // Group by word and count definitions
  const termMap = new Map<string, { count: number; upvotes: number }>()

  data.forEach((def) => {
    const existing = termMap.get(def.word)
    if (existing) {
      existing.count += 1
      existing.upvotes += def.upvotes
    } else {
      termMap.set(def.word, { count: 1, upvotes: def.upvotes })
    }
  })

  // Convert to array
  return Array.from(termMap.entries()).map(([word, stats]) => ({
    word,
    definitionCount: stats.count,
    totalUpvotes: stats.upvotes,
  }))
}

export async function getSlangTermsByLetter(letter: string): Promise<SlangTerm[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("definitions")
    .select("word, upvotes")
    .ilike("word", `${letter}%`)
    .order("word")

  if (error) {
    console.error(`Error fetching slang terms starting with ${letter}:`, error)
    return []
  }

  // Group by word and count definitions
  const termMap = new Map<string, { count: number; upvotes: number }>()

  data.forEach((def) => {
    const existing = termMap.get(def.word)
    if (existing) {
      existing.count += 1
      existing.upvotes += def.upvotes
    } else {
      termMap.set(def.word, { count: 1, upvotes: def.upvotes })
    }
  })

  // Convert to array
  return Array.from(termMap.entries()).map(([word, stats]) => ({
    word,
    definitionCount: stats.count,
    totalUpvotes: stats.upvotes,
  }))
}

export async function getPopularSlangTerms(limit = 10): Promise<SlangTerm[]> {
  const allTerms = await getAllSlangTerms()

  // Sort by total upvotes (descending)
  return allTerms.sort((a, b) => b.totalUpvotes - a.totalUpvotes).slice(0, limit)
}

