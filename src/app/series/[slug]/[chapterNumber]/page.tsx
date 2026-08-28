import { Footer } from "@/components/home/Footer";
import { Navbar } from "@/components/home/Navbar";
import { ChapterReader } from "@/components/series/ChapterReader";
import { constructMetadata } from "@/lib/metadata";
import { chapterService } from "@/services/chapter.service";
import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string; chapterNumber: string }>;
  searchParams?: Promise<{ lang?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, chapterNumber } = await params;
  const { lang } = (await searchParams) || {};
  const numberStr = chapterNumber.replace("chapter-", "");
  const number = parseInt(numberStr);

  try {
    const res = await chapterService.getChapterByNumber(slug, number, lang);
    const chapter = res?.data;
    if (chapter) {
      const seriesTitle = chapter.series?.title || slug;
      const chapterTitle = chapter.title ? ` - ${chapter.title}` : "";
      const langLabel = chapter.language && chapter.language !== "en" ? ` [${chapter.language.toUpperCase()}]` : "";
      return constructMetadata({
        title: `${seriesTitle} Chapter ${chapter.number}${chapterTitle}${langLabel}`,
        description: `Read ${seriesTitle} Chapter ${chapter.number} online in high definition for free.`,
        image: chapter.series?.coverUrl || undefined,
        keywords: [seriesTitle, `Chapter ${chapter.number}`, "manga chapter", "webtoon reader"],
        type: "article",
      });
    }
  } catch (e) {
    // fallback
  }

  return constructMetadata({
    title: `Chapter ${number} - ${slug}`,
    description: `Read chapter online.`,
  });
}

export default async function ChapterReadingPage({ params, searchParams }: Props) {
  const { slug, chapterNumber } = await params;
  const { lang } = (await searchParams) || {};

  const numberStr = chapterNumber.replace("chapter-", "");
  const number = parseInt(numberStr);

  const res = await chapterService.getChapterByNumber(slug, number, lang);
  const chapter = res?.data;

  if (!chapter) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-foreground/50">Chapter not found</h1>
          <Link href={`/series/${slug}`} className="text-primary hover:underline">
            Return to series
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      
      <ChapterReader slug={slug} initialChapter={chapter} />
      <Footer />
    </div>
  );
}
