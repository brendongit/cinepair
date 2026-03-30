import { Suspense } from "react";
import { getWatchlist } from "@/app/actions";
import { HomeClient } from "@/components/home-client";
import { UpcomingCinema } from "@/components/upcoming-cinema";
import { Skeleton } from "@/components/ui/skeleton";
import type { WatchlistItem } from "@/lib/types";

export const dynamic = "force-dynamic";

function WatchlistSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
      ))}
    </div>
  );
}

export default async function Home() {
  const watchlist = (await getWatchlist().catch(() => [])) as WatchlistItem[];

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">🎬 Cinematch</h1>
        <p className="text-muted-foreground text-sm">A lista do casal</p>
      </div>

      <HomeClient
        watchlist={watchlist}
        upcomingSlot={
          <Suspense fallback={<WatchlistSkeleton />}>
            <UpcomingCinema />
          </Suspense>
        }
      />
    </main>
  );
}
