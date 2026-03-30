"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MediaType, Category } from "@/lib/types";

export async function addToWatchlist(data: {
  tmdb_id: number;
  title: string;
  poster_path: string;
  media_type: MediaType;
  category: Category;
  release_date: string;
  vote_average: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("watchlist").insert(data);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function removeFromWatchlist(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("watchlist").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function toggleWatched(id: string, watched: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("watchlist")
    .update({ watched })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function getWatchlist() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
