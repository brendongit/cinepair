const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export function getTMDBImageUrl(path: string | null): string {
  if (!path) return "/placeholder-poster.png";
  return `${TMDB_IMAGE_BASE}${path}`;
}

export async function searchMulti(query: string) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const res = await fetch(
    `${TMDB_BASE_URL}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`
  );
  if (!res.ok) throw new Error("Failed to search TMDB");
  return res.json();
}

export async function getUpcomingMovies() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const today = new Date().toISOString().split("T")[0];
  const res = await fetch(
    `${TMDB_BASE_URL}/movie/upcoming?api_key=${apiKey}&language=pt-BR&page=1&region=BR`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error("Failed to fetch upcoming movies");
  const data = await res.json();
  // Filter only future releases
  data.results = data.results.filter(
    (movie: { release_date: string }) => movie.release_date && movie.release_date >= today
  );
  return data;
}
