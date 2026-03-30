"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { removeFromWatchlist, toggleWatched } from "@/app/actions";
import { getTMDBImageUrl } from "@/lib/tmdb";
import type { WatchlistItem, Category } from "@/lib/types";
import { X, Check } from "lucide-react";

interface WatchlistProps {
  initialItems: WatchlistItem[];
  category: Category;
}

function groupByMonth(items: WatchlistItem[]) {
  const groups: Record<string, WatchlistItem[]> = {};
  for (const item of items) {
    const key = item.release_date
      ? new Date(item.release_date + "T00:00:00").toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })
      : "Sem data";
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

export function Watchlist({ initialItems, category }: WatchlistProps) {
  const [items, setItems] = useState(
    initialItems.filter((i) => i.category === category)
  );

  useEffect(() => {
    setItems(initialItems.filter((i) => i.category === category));
  }, [initialItems, category]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("watchlist-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "watchlist" },
        (payload) => {
          const newItem = payload.new as WatchlistItem;
          if (newItem.category === category) {
            setItems((prev) => {
              if (prev.find((i) => i.id === newItem.id)) return prev;
              return [newItem, ...prev];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "watchlist" },
        (payload) => {
          const updated = payload.new as WatchlistItem;
          setItems((prev) =>
            prev.map((i) => (i.id === updated.id ? updated : i))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "watchlist" },
        (payload) => {
          setItems((prev) => prev.filter((i) => i.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-4xl mb-3">{category === "cinema" ? "🍿" : "📺"}</p>
        <p className="text-sm">Nenhum título na lista ainda.</p>
        <p className="text-xs mt-1">Use a busca acima para adicionar!</p>
      </div>
    );
  }

  if (category === "cinema") {
    const sorted = [...items].sort((a, b) =>
      (a.release_date ?? "").localeCompare(b.release_date ?? "")
    );
    const groups = groupByMonth(sorted);

    return (
      <div className="space-y-6">
        {Object.entries(groups).map(([month, movieList]) => (
          <div key={month}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 capitalize">
              {month}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {movieList.map((item) => (
                <PosterCard key={item.id} item={item} showWatched={false} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const unwatched = items.filter((i) => !i.watched);
  const watched = items.filter((i) => i.watched);
  const sorted = [...unwatched, ...watched];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {sorted.map((item) => (
        <PosterCard key={item.id} item={item} showWatched />
      ))}
    </div>
  );
}

function PosterCard({
  item,
  showWatched,
}: {
  item: WatchlistItem;
  showWatched: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    await removeFromWatchlist(item.id);
  }

  async function handleToggleWatched() {
    setLoading(true);
    try {
      await toggleWatched(item.id, !item.watched);
    } finally {
      setLoading(false);
    }
  }

  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <div
      className={`relative group rounded-xl overflow-hidden bg-muted aspect-[2/3] transition-opacity ${
        item.watched ? "opacity-50 ring-2 ring-green-500" : ""
      }`}
    >
      <Image
        src={getTMDBImageUrl(item.poster_path)}
        alt={item.title}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {showWatched && rating && (
        <div className="absolute top-2 right-2 bg-yellow-400/90 text-black text-xs font-bold px-1.5 py-0.5 rounded-md leading-none">
          ★ {rating}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p className="text-white text-xs font-semibold leading-tight line-clamp-2">
          {item.title}
        </p>
        {item.release_date && (
          <p className="text-white/70 text-xs mt-0.5">
            {new Date(item.release_date + "T00:00:00").toLocaleDateString(
              "pt-BR",
              { day: "2-digit", month: "short", year: "numeric" }
            )}
          </p>
        )}
        {showWatched && (
          <button
            onClick={handleToggleWatched}
            disabled={loading}
            className={`mt-1.5 w-full flex items-center justify-center gap-1 text-xs py-1 rounded-md font-medium transition ${
              item.watched
                ? "bg-green-500/80 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Check className="h-3 w-3" />
            {item.watched ? "Assistido" : "Marcar como assistido"}
          </button>
        )}
      </div>

      <button
        onClick={handleRemove}
        className="absolute top-2 left-2 bg-black/60 hover:bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
      >
        <X className="h-3 w-3 text-white" />
      </button>
    </div>
  );
}
