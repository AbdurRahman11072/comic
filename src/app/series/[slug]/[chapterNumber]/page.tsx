import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { chapterService } from "@/services/chapter.service";
import { ChapterReader } from "@/components/series/ChapterReader";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string; chapterNumber: string }>;
}

export default async function ChapterReadingPage({ params }: Props) {
  const { slug, chapterNumber } = await params;
  
  // Extract number from "chapter-1" or just "1"
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
          <Link href={`/series/${slug}`} className="text-primary hover:underline">Return to series</Link>
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
