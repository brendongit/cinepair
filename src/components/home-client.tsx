"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "@/components/search-bar";
import { Watchlist } from "@/components/watchlist";
import type { WatchlistItem, Category } from "@/lib/types";

export function HomeClient({
  watchlist,
  upcomingSlot,
}: {
  watchlist: WatchlistItem[];
  upcomingSlot: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<string>("cinema");

  const activeCategory: Category | null =
    activeTab === "cinema" ? "cinema" : activeTab === "streaming" ? "streaming" : null;

  return (
    <>
      {activeCategory && (
        <SearchBar watchlistItems={watchlist} category={activeCategory} />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-12">
          <TabsTrigger value="cinema" className="flex-1 h-full text-sm font-semibold">
            🍿 Cinema
          </TabsTrigger>
          <TabsTrigger value="streaming" className="flex-1 h-full text-sm font-semibold">
            📺 Em Casa
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1 h-full text-sm font-semibold">
            🗓 Estreias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cinema" className="mt-4">
          <Watchlist initialItems={watchlist} category="cinema" />
        </TabsContent>

        <TabsContent value="streaming" className="mt-4">
          <Watchlist initialItems={watchlist} category="streaming" />
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          {upcomingSlot}
        </TabsContent>
      </Tabs>
    </>
  );
}
