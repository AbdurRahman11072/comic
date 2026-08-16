import type { Metadata } from "next";
import { LatestClient } from "@/components/home/LatestClient";
import { constructMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Latest Chapter Updates & Releases",
    description: "Read the newest chapters and fresh updates of popular manhwa, manga, and comics published today.",
    keywords: ["latest chapters", "new releases", "recent webtoons", "updated manga", "daily chapters"],
  });
}

export default function LatestSeriesPage() {
  return <LatestClient />;
}
