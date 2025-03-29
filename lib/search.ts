"use server"

import { createServerClient } from "./supabase"

export type SearchResult = {
  id: string
  word: string
  definition: string
  example: string | null
  upvotes: number
  downvotes: number
  created_at: string
  username: string
  tags: string[]
  match_type: "word" | "definition" | "example"
}

export async function searchSlangTerms(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  const supabase = createServerClient()
  const searchTerm = query.trim().toLowerCase()

  // Search in words (exact match gets priority)
  const { data: wordMatches, error: wordError } = await supabase
    .from("definitions")
    .select(`
      id, word, definition, example, upvotes, downvotes, created_at,
      users!inner (username),
      definition_tags!inner (
        tags:tag_id (name)
      )
    `)
    .ilike("word", `%${searchTerm}%`)
    .order("upvotes", { ascending: false })
    .limit(10)

  if (wordError) {
    console.error("Error searching words:", wordError)
    return []
  }

  // Search in definitions
  const { data: definitionMatches, error: defError } = await supabase
    .from("definitions")
    .select(`
      id, word, definition, example, upvotes, downvotes, created_at,
      users!inner (username),
      definition_tags!inner (
        tags:tag_id (name)
      )
    `)
    .ilike("definition", `%${searchTerm}%`)
    .not("word", "ilike", `%${searchTerm}%`) // Exclude word matches to avoid duplicates
    .order("upvotes", { ascending: false })
    .limit(10)

  if (defError) {
    console.error("Error searching definitions:", defError)
    return []
  }

  // Search in examples
  const { data: exampleMatches, error: exampleError } = await supabase
    .from("definitions")
    .select(`
      id, word, definition, example, upvotes, downvotes, created_at,
      users!inner (username),
      definition_tags!inner (
        tags:tag_id (name)
      )
    `)
    .ilike("example", `%${searchTerm}%`)
    .not("word", "ilike", `%${searchTerm}%`) // Exclude word matches
    .not("definition", "ilike", `%${searchTerm}%`) // Exclude definition matches
    .order("upvotes", { ascending: false })
    .limit(10)

  if (exampleError) {
    console.error("Error searching examples:", exampleError)
    return []
  }

  // Format word matches
  const formattedWordMatches: SearchResult[] = (wordMatches || []).map((item) => ({
    id: item.id,
    word: item.word,
    definition: item.definition,
    example: item.example,
    upvotes: item.upvotes,
    downvotes: item.downvotes,
    created_at: item.created_at,
    username: item.users.username,
    tags: item.definition_tags.map((dt: any) => dt.tags.name),
    match_type: "word",
  }))

  // Format definition matches
  const formattedDefMatches: SearchResult[] = (definitionMatches || []).map((item) => ({
    id: item.id,
    word: item.word,
    definition: item.definition,
    example: item.example,
    upvotes: item.upvotes,
    downvotes: item.downvotes,
    created_at: item.created_at,
    username: item.users.username,
    tags: item.definition_tags.map((dt: any) => dt.tags.name),
    match_type: "definition",
  }))

  // Format example matches
  const formattedExampleMatches: SearchResult[] = (exampleMatches || []).map((item) => ({
    id: item.id,
    word: item.word,
    definition: item.definition,
    example: item.example,
    upvotes: item.upvotes,
    downvotes: item.downvotes,
    created_at: item.created_at,
    username: item.users.username,
    tags: item.definition_tags.map((dt: any) => dt.tags.name),
    match_type: "example",
  }))

  // Combine all results, prioritizing word matches
  return [...formattedWordMatches, ...formattedDefMatches, ...formattedExampleMatches]
}

export async function searchTags(query: string): Promise<string[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  const supabase = createServerClient()
  const searchTerm = query.trim().toLowerCase()

  const { data, error } = await supabase
    .from("tags")
    .select("name")
    .ilike("name", `%${searchTerm}%`)
    .order("name")
    .limit(10)

  if (error) {
    console.error("Error searching tags:", error)
    return []
  }

  return data.map((tag) => tag.name)
}

