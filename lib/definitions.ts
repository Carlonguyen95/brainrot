"use server"

import { createServerClient } from "./supabase"
import { getCurrentUser } from "./auth"

export type Definition = {
  id: string
  word: string
  definition: string
  example?: string
  user_id: string
  upvotes: number
  downvotes: number
  created_at: string
  updated_at: string
  username?: string
  tags?: string[]
}

export async function getDefinitionsByWord(word: string): Promise<Definition[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("definitions")
    .select(`
      *,
      users:user_id (username),
      definition_tags!inner (
        tags:tag_id (name)
      )
    `)
    .eq("word", word.toLowerCase())
    .order("upvotes", { ascending: false })

  if (error) {
    console.error("Error fetching definitions:", error)
    return []
  }

  // Transform the data to match our Definition type
  return data.map((item) => ({
    ...item,
    username: item.users?.username,
    tags: item.definition_tags.map((dt: any) => dt.tags.name),
  }))
}

export async function getRecentDefinitions(limit = 10, offset = 0): Promise<Definition[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("definitions")
    .select(`
      *,
      users:user_id (username),
      definition_tags!inner (
        tags:tag_id (name)
      )
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching recent definitions:", error)
    return []
  }

  // Transform the data to match our Definition type
  return data.map((item) => ({
    ...item,
    username: item.users?.username,
    tags: item.definition_tags.map((dt: any) => dt.tags.name),
  }))
}

export async function getRandomDefinitions(limit = 7): Promise<Definition[]> {
  const supabase = createServerClient()

  // Get total count of definitions
  const { count } = await supabase.from("definitions").select("*", { count: "exact", head: true })

  if (!count) return []

  // Generate random offset
  const randomOffset = Math.floor(Math.random() * Math.max(0, count - limit))

  const { data, error } = await supabase
    .from("definitions")
    .select(`
      *,
      users:user_id (username),
      definition_tags!inner (
        tags:tag_id (name)
      )
    `)
    .range(randomOffset, randomOffset + limit - 1)

  if (error) {
    console.error("Error fetching random definitions:", error)
    return []
  }

  // Transform the data to match our Definition type
  return data.map((item) => ({
    ...item,
    username: item.users?.username,
    tags: item.definition_tags.map((dt: any) => dt.tags.name),
  }))
}

export async function getWordOfTheDay(): Promise<Definition | null> {
  const supabase = createServerClient()

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // First check if we already have a word of the day for today
  const { data: existingWotd } = await supabase
    .from("word_of_the_day")
    .select("definition_id")
    .eq("date", today)
    .single()

  let definitionId: string

  if (existingWotd) {
    definitionId = existingWotd.definition_id
  } else {
    // Get a random definition with high upvotes
    const { data: randomDef } = await supabase
      .from("definitions")
      .select("id")
      .order("upvotes", { ascending: false })
      .limit(20)

    if (!randomDef || randomDef.length === 0) {
      return null
    }

    // Pick a random definition from the top 20
    definitionId = randomDef[Math.floor(Math.random() * randomDef.length)].id

    // Store it as today's word of the day
    await supabase.from("word_of_the_day").insert({
      date: today,
      definition_id: definitionId,
    })
  }

  // Get the full definition
  const { data, error } = await supabase
    .from("definitions")
    .select(`
      *,
      users:user_id (username),
      definition_tags!inner (
        tags:tag_id (name)
      )
    `)
    .eq("id", definitionId)
    .single()

  if (error) {
    console.error("Error fetching word of the day:", error)
    return null
  }

  return {
    ...data,
    username: data.users?.username,
    tags: data.definition_tags.map((dt: any) => dt.tags.name),
  }
}

export async function createDefinition(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "You must be logged in to submit a definition" }
  }

  const word = (formData.get("word") as string).toLowerCase()
  const definition = formData.get("definition") as string
  const example = formData.get("example") as string
  const tagsString = formData.get("tags") as string

  if (!word || !definition) {
    return { error: "Word and definition are required" }
  }

  const supabase = createServerClient()

  // Start a transaction
  const { data: definitionData, error: definitionError } = await supabase
    .from("definitions")
    .insert({
      word,
      definition,
      example,
      user_id: user.id,
    })
    .select("id")
    .single()

  if (definitionError) {
    return { error: definitionError.message }
  }

  // Process tags
  if (tagsString) {
    const tagNames = tagsString.split(",").map((tag) => tag.trim().toLowerCase())

    // Insert tags that don't exist yet
    for (const tagName of tagNames) {
      // Check if tag exists
      const { data: existingTag } = await supabase.from("tags").select("id").eq("name", tagName).single()

      let tagId: string

      if (existingTag) {
        tagId = existingTag.id
      } else {
        // Create new tag
        const { data: newTag, error: tagError } = await supabase
          .from("tags")
          .insert({ name: tagName })
          .select("id")
          .single()

        if (tagError) {
          console.error("Error creating tag:", tagError)
          continue
        }

        tagId = newTag.id
      }

      // Link tag to definition
      await supabase.from("definition_tags").insert({
        definition_id: definitionData.id,
        tag_id: tagId,
      })
    }
  }

  return { success: true, definitionId: definitionData.id }
}

export async function updateDefinition(id: string, formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "You must be logged in to update a definition" }
  }

  const supabase = createServerClient()

  // Check if user owns this definition
  const { data: definitionData } = await supabase.from("definitions").select("user_id").eq("id", id).single()

  if (!definitionData || definitionData.user_id !== user.id) {
    return { error: "You do not have permission to edit this definition" }
  }

  const definition = formData.get("definition") as string
  const example = formData.get("example") as string

  // Update definition
  const { error: updateError } = await supabase
    .from("definitions")
    .update({
      definition,
      example,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (updateError) {
    return { error: updateError.message }
  }

  return { success: true }
}

export async function deleteDefinition(id: string) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "You must be logged in to delete a definition" }
  }

  const supabase = createServerClient()

  // Check if user owns this definition
  const { data: definitionData } = await supabase.from("definitions").select("user_id, word").eq("id", id).single()

  if (!definitionData || definitionData.user_id !== user.id) {
    return { error: "You do not have permission to delete this definition" }
  }

  // Delete definition (cascade will handle definition_tags)
  const { error: deleteError } = await supabase.from("definitions").delete().eq("id", id)

  if (deleteError) {
    return { error: deleteError.message }
  }

  return { success: true, word: definitionData.word }
}

export async function getRelatedWords(word: string, limit = 5): Promise<string[]> {
  const supabase = createServerClient()

  try {
    // Fetch tags associated with the given word
    const { data: tagData, error: tagError } = await supabase
      .from("definitions")
      .select(`
        id,
        definition_tags!inner (
          tag_id
        )
      `)
      .eq("word", word.toLowerCase())

    if (tagError || !tagData || tagData.length === 0) {
      console.log(`No tags found for word: ${word}`)
      return []
    }

    // Extract tag IDs, ensuring they're valid
    const tagIds: string[] = []

    tagData.forEach((item) => {
      if (item.definition_tags && Array.isArray(item.definition_tags)) {
        item.definition_tags.forEach((tag) => {
          if (tag && tag.tag_id) {
            tagIds.push(tag.tag_id)
          }
        })
      }
    })

    if (tagIds.length === 0) {
      console.log(`No valid tag IDs found for word: ${word}`)
      return []
    }

    // Fetch definitions that share these tags, excluding the original word
    const { data: relatedData, error: relatedError } = await supabase
      .from("definition_tags")
      .select(`
        definitions!inner (
          word
        )
      `)
      .in("tag_id", tagIds)
      .not("definitions.word", "eq", word.toLowerCase())
      .limit(limit * 3) // Fetch more to increase chance of diverse results

    if (relatedError || !relatedData || relatedData.length === 0) {
      console.log(`No related words found for tags of word: ${word}`)
      return []
    }

    // Extract words and count their occurrences
    const wordCounts: { [word: string]: number } = {}

    relatedData.forEach((item) => {
      if (item.definitions && item.definitions.word) {
        const relatedWord = item.definitions.word as string
        wordCounts[relatedWord] = (wordCounts[relatedWord] || 0) + 1
      }
    })

    // Sort words by frequency and select top results
    const sortedWords = Object.entries(wordCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([word]) => word)
      .slice(0, limit)

    return sortedWords
  } catch (error) {
    console.error("Error in getRelatedWords:", error)
    return []
  }
}

