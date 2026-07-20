import { chapterService } from "@/services/chapter.service";
import { ChapterForm } from "@/components/dashboard/ChapterForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditChapterPage({ params }: Props) {
  const { id } = await params;
  const res = await chapterService.getChapterById(id);
  const chapter = res?.data;

  if (!chapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-2xl font-bold text-red-500">Chapter Not Found</h2>
        <p className="text-muted-foreground">The chapter you're trying to edit does not exist.</p>
      </div>
    );
  }

  return <ChapterForm initialData={chapter} />;
}
