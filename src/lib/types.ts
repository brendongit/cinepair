export type MediaType = "movie" | "tv";
export type Category = "streaming" | "cinema";

export interface WatchlistItem {
  id: string;
  created_at: string;
  tmdb_id: number;
  title: string;
  poster_path: string;
  media_type: MediaType;
  category: Category;
  release_date: string;
  vote_average: number;
  watched: boolean;
}

export interface TMDBMovie {
  id: number;
  title: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: MediaType;
  overview: string;
  vote_average?: number;
}

export interface TMDBSearchResult {
  results: TMDBMovie[];
  total_results: number;
  total_pages: number;
}

export interface TMDBUpcomingResult {
  results: TMDBMovie[];
  total_results: number;
  total_pages: number;
}
