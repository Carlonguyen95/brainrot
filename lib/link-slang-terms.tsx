import type React from "react";
import Link from "next/link";
import { createServerClient } from "./supabase";

// Cache for slang terms to avoid fetching on every render
let cachedSlangTerms: string[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to fetch all slang terms from the database
export async function fetchSlangTerms(): Promise<string[]> {
  // Use cache if available and not expired
  const now = Date.now();
  if (cachedSlangTerms && now - lastFetchTime < CACHE_DURATION) {
    return cachedSlangTerms;
  }

  try {
    const supabase = createServerClient();

    // Get all unique words from the definitions table
    const { data, error } = await supabase
      .from("definitions")
      .select("word")
      .order("word");

    if (error) {
      console.error("Error fetching slang terms:", error);
      return cachedSlangTerms || []; // Return cached terms if available, otherwise empty array
    }

    // Extract unique words
    const terms = [...new Set(data.map((item) => item.word.toLowerCase()))];

    // Update cache
    cachedSlangTerms = terms;
    lastFetchTime = now;

    return terms;
  } catch (error) {
    console.error("Error in fetchSlangTerms:", error);
    return cachedSlangTerms || []; // Return cached terms if available, otherwise empty array
  }
}

export async function linkSlangTerms(text: string): Promise<React.ReactNode[]> {
  if (!text) return [text];

  // Fetch slang terms from the database
  const slangTerms = await fetchSlangTerms();

  // Sort terms by length (descending) to ensure longer phrases are matched first
  // e.g., "no cap" should be matched before "cap"
  const sortedTerms = [...slangTerms].sort((a, b) => b.length - a.length);

  // Create a regex pattern for all slang terms
  // Use word boundaries to ensure we match whole words
  const pattern = new RegExp(
    `\\b(${sortedTerms
      .map((term) => term.replace(/\s+/g, "\\s+"))
      .join("|")})\\b`,
    "gi"
  );

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // Find all matches and create an array of text and link elements
  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the linked term
    const term = match[0].toLowerCase();
    parts.push(
      <Link
        key={`${term}-${match.index}`}
        href={`/define/${encodeURIComponent(term)}`}
        className="text-blue-600 hover:underline font-medium"
      >
        {match[0]}
      </Link>
    );

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
