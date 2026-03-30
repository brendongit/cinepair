import Image from "next/image";
import { getUpcomingMovies } from "@/lib/tmdb";
import { getTMDBImageUrl } from "@/lib/tmdb";
import type { TMDBMovie } from "@/lib/types";

function groupByMonth(movies: TMDBMovie[]) {
  const groups: Record<string, TMDBMovie[]> = {};
  for (const movie of movies) {
    const date = new Date((movie.release_date ?? "") + "T00:00:00");
    const key = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(movie);
  }
  return groups;
}

export async function UpcomingCinema() {
  let data: { results?: TMDBMovie[] };
  try {
    data = await getUpcomingMovies();
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-4xl mb-3">🎬</p>
        <p className="text-sm">Não foi possível carregar os lançamentos.</p>
        <p className="text-xs mt-1">Verifique sua chave da API TMDB.</p>
      </div>
    );
  }
  const groups = groupByMonth(data.results || []);

  if (Object.keys(groups).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-4xl mb-3">🎬</p>
        <p className="text-sm">Nenhum lançamento encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([month, movies]) => (
        <div key={month}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 capitalize">
            {month}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {movies.map((movie) => (
              <div key={movie.id} className="relative rounded-xl overflow-hidden bg-muted aspect-[2/3]">
                <Image
                  src={getTMDBImageUrl(movie.poster_path)}
                  alt={movie.title || ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-xs font-semibold line-clamp-2">{movie.title}</p>
                  <p className="text-white/70 text-xs mt-0.5">
                    {new Date((movie.release_date ?? "") + "T00:00:00").toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
