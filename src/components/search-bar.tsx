"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { searchMulti, getTMDBImageUrl } from "@/lib/tmdb";
import { addToWatchlist } from "@/app/actions";
import type { TMDBMovie, Category, WatchlistItem } from "@/lib/types";
import { Search, Loader2, CheckCircle2, Plus } from "lucide-react";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

interface SearchBarProps {
  watchlistItems?: WatchlistItem[];
  category: Category;
}

const categoryLabel: Record<Category, string> = {
  cinema: "🍿 Adicionar ao Cinema",
  streaming: "📺 Adicionar em Casa",
};

export function SearchBar({ watchlistItems = [], category }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchMulti(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleAdd(movie: TMDBMovie) {
    setAdding(movie.id);
    try {
      await addToWatchlist({
        tmdb_id: movie.id,
        title: movie.title || movie.name || "",
        poster_path: movie.poster_path || "",
        media_type: movie.media_type,
        category,
        release_date: movie.release_date || movie.first_air_date || "",
        vote_average: movie.vote_average ?? 0,
      });
      setQuery("");
      setOpen(false);
    } finally {
      setAdding(null);
    }
  }

  const watchlistTmdbIds = new Set(watchlistItems.map((i) => i.tmdb_id));
  const currentYear = new Date().getFullYear();

  const results = data?.results
    ?.filter((r: TMDBMovie) => {
      if (r.media_type !== "movie" && r.media_type !== "tv") return false;
      if (category === "cinema") {
        const year = parseInt((r.release_date || r.first_air_date || "0").slice(0, 4));
        return year >= currentYear;
      }
      return true;
    })
    .slice(0, 8);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9 h-12 text-base rounded-xl"
          placeholder={
            category === "cinema"
              ? "Buscar para o cinema..."
              : "Buscar para assistir em casa..."
          }
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.length >= 2 && setOpen(true)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-background border rounded-xl shadow-xl z-50 overflow-hidden">
          <ul className="max-h-80 overflow-y-auto divide-y">
            {results.map((movie: TMDBMovie) => {
              const alreadyAdded = watchlistTmdbIds.has(movie.id);
              return (
                <li
                  key={movie.id}
                  className={`flex flex-col gap-2 p-3 ${alreadyAdded ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-muted">
                      <Image
                        src={getTMDBImageUrl(movie.poster_path)}
                        alt={movie.title || movie.name || ""}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-sm">
                          {movie.title || movie.name}
                        </p>
                        {alreadyAdded && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {alreadyAdded
                          ? "Já na lista"
                          : `${movie.media_type === "movie" ? "Filme" : "Série"} • ${(movie.release_date || movie.first_air_date || "").slice(0, 4)}`}
                      </p>
                    </div>
                  </div>
                  {!alreadyAdded && (
                    <button
                      onClick={() => handleAdd(movie)}
                      disabled={adding === movie.id}
                      className="flex items-center justify-center gap-1 w-full text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                    >
                      {adding === movie.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-3 w-3" />
                          {categoryLabel[category]}
                        </>
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
