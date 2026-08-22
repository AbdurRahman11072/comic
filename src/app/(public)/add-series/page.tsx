import type { Metadata } from "next";
import { SeriesForm } from "@/components/series/SeriesForm";
import { constructMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Publish New Series",
    description: "Publish a new manga, manhwa, or comic series to your studio channel.",
    noIndex: true,
  });
}

export default function AddSeriesPage() {
  return (
    <div className="bg-background relative overflow-hidden w-full">
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 py-10 max-w-5xl mx-auto px-4">
        <SeriesForm />
      </div>
    </div>
  );
}
