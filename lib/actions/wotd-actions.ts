"use server";

import { createServerClient } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { Definition } from "@/lib/definitions";

export type WordOfTheDay = {
  date: string;
  definition_id: string;
  definition: Definition | null;
};

// Get Word of the Day for a specific date
export async function getWordOfTheDayByDate(
  date: string
): Promise<WordOfTheDay | null> {
  try {
    const supabase = createServerClient();

    // Get the WOTD entry
    const { data: wotd, error } = await supabase
      .from("word_of_the_day")
      .select("date, definition_id")
      .eq("date", date)
      .single();

    if (error || !wotd) {
      console.error("Error fetching word of the day:", error);
      return null;
    }

    // Get the definition
    const { data: definition } = await supabase
      .from("definitions")
      .select(
        `
        *,
        users!inner (username),
        definition_tags!inner (
          tags:tag_id (name)
        )
      `
      )
      .eq("id", wotd.definition_id)
      .single();

    // Transform the definition data
    const transformedDefinition = definition
      ? ({
          ...definition,
          username: definition.users?.username,
          tags: definition.definition_tags.map((dt: any) => dt.tags.name),
        } as Definition)
      : null;

    return {
      date: wotd.date,
      definition_id: wotd.definition_id,
      definition: transformedDefinition,
    };
  } catch (error) {
    console.error("Error in getWordOfTheDayByDate:", error);
    return null;
  }
}

// Get today's Word of the Day
export async function getTodaysWordOfTheDay(): Promise<WordOfTheDay | null> {
  try {
    const supabase = createServerClient();

    // Get today's date in local timezone, set to midnight
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      .toISOString()
      .split("T")[0];

    // First check if we have a word for today
    const { data: existingWotd } = await supabase
      .from("word_of_the_day")
      .select("definition_id")
      .eq("date", today)
      .single();

    if (existingWotd) {
      return getWordOfTheDayByDate(today);
    }

    // If no word exists for today, create a new one
    // Get a random definition from top 20 most upvoted
    const { data: randomDef } = await supabase
      .from("definitions")
      .select("id")
      .order("upvotes", { ascending: false })
      .limit(20);

    if (!randomDef || randomDef.length === 0) {
      return null;
    }

    // Pick a random definition
    const definitionId =
      randomDef[Math.floor(Math.random() * randomDef.length)].id;

    // Create new WOTD entry
    const { error } = await supabase.from("word_of_the_day").insert({
      date: today,
      definition_id: definitionId,
    });

    if (error) {
      console.error("Error creating new word of the day:", error);
      return null;
    }

    return getWordOfTheDayByDate(today);
  } catch (error) {
    console.error("Error in getTodaysWordOfTheDay:", error);
    return null;
  }
}

// Set Word of the Day (admin only)
export async function setWordOfTheDay(
  definitionId: string,
  date: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to set Word of the Day",
      };
    }

    // Check if user is an admin
    const supabase = createServerClient();
    const { data: adminData } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!adminData) {
      return { success: false, error: "Only admins can set Word of the Day" };
    }

    // Check if definition exists
    const { data: definition } = await supabase
      .from("definitions")
      .select("id, word")
      .eq("id", definitionId)
      .single();

    if (!definition) {
      return { success: false, error: "Definition not found" };
    }

    // Check if there's already a WOTD for this date
    const { data: existingWotd } = await supabase
      .from("word_of_the_day")
      .select("id")
      .eq("date", date)
      .single();

    if (existingWotd) {
      // Update existing entry
      const { error } = await supabase
        .from("word_of_the_day")
        .update({ definition_id: definitionId })
        .eq("id", existingWotd.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Create new entry
      const { error } = await supabase
        .from("word_of_the_day")
        .insert({ date, definition_id: definitionId });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    revalidatePath("/");
    revalidatePath(`/define/${definition.word}`);
    revalidatePath("/admin/wotd");

    return { success: true };
  } catch (error) {
    console.error("Error in setWordOfTheDay:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Get Word of the Day history
export async function getWordOfTheDayHistory(
  limit = 30
): Promise<WordOfTheDay[]> {
  try {
    const supabase = createServerClient();

    // Get the WOTD entries
    const { data: wotdEntries, error } = await supabase
      .from("word_of_the_day")
      .select("date, definition_id")
      .order("date", { ascending: false })
      .limit(limit);

    if (error || !wotdEntries) {
      console.error("Error fetching word of the day history:", error);
      return [];
    }

    // Get all the definitions at once
    const definitionIds = wotdEntries.map((entry) => entry.definition_id);

    const { data: definitions } = await supabase
      .from("definitions")
      .select(
        `
        *,
        users!inner (username),
        definition_tags!inner (
          tags:tag_id (name)
        )
      `
      )
      .in("id", definitionIds);

    // Create a map of definition IDs to definitions
    const definitionMap = new Map();

    if (definitions) {
      definitions.forEach((def) => {
        definitionMap.set(def.id, {
          ...def,
          username: def.users?.username,
          tags: def.definition_tags.map((dt: any) => dt.tags.name),
        });
      });
    }

    // Map the WOTD entries to include their definitions
    return wotdEntries.map((entry) => ({
      date: entry.date,
      definition_id: entry.definition_id,
      definition: definitionMap.get(entry.definition_id) || null,
    }));
  } catch (error) {
    console.error("Error in getWordOfTheDayHistory:", error);
    return [];
  }
}
