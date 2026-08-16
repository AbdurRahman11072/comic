import type { Metadata } from "next";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { chapterService } from "@/services/chapter.service";
import { ChapterReader } from "@/components/series/ChapterReader";
import Link from "next/link";
import { constructMetadata } from "@/lib/metadata";

interface Props {
  params: Promise<{ slug: string; chapterNumber: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, chapterNumber } = await params;
  const numberStr = chapterNumber.replace("chapter-", "");
  const number = parseInt(numberStr);

  try {
    const res = await chapterService.getChapterByNumber(slug, number);
    const chapter = res?.data;
    if (chapter) {
      const seriesTitle = chapter.series?.title || slug;
      const chapterTitle = chapter.title ? ` - ${chapter.title}` : "";
      return constructMetadata({
        title: `${seriesTitle} Chapter ${chapter.number}${chapterTitle}`,
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

export default async function ChapterReadingPage({ params }: Props) {
  const { slug, chapterNumber } = await params;

  const numberStr = chapterNumber.replace("chapter-", "");
  const number = parseInt(numberStr);

  const res = await chapterService.getChapterByNumber(slug, number);
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
      <Navbar />
      <ChapterReader slug={slug} initialChapter={chapter} />
      <Footer />
    </div>
  );
}
