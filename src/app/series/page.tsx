import type { Metadata } from "next";
import { SeriesClient } from "@/components/series/SeriesClient";
import { constructMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Browse All Series & Manga",
    description: "Explore our vast library of trending webtoons, manhwa, manga, and comics. Filter by genres, release status, and formats.",
    keywords: ["all series", "browse manga", "manhwa library", "webtoon catalog", "popular comics"],
  });
}

export default function SeriesPage() {
  return <SeriesClient />;
}
