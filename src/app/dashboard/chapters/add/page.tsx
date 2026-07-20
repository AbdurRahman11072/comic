"use client";

import { ChapterForm } from "@/components/dashboard/ChapterForm";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AddChapterContent() {
  const searchParams = useSearchParams();
  const seriesId = searchParams.get("seriesId");
  
  return <ChapterForm initialData={seriesId ? { seriesId } : undefined} />;
}

export default function AddChapterPage() {
  return (
    <Suspense fallback={<div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <AddChapterContent />
    </Suspense>
  );
}
