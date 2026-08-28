import { ChaptersTable } from "@/components/dashboard/ChaptersTable";
import { chapterService } from "@/services/chapter.service";
import { userService } from "@/services/user.service";
import { Upload } from "lucide-react";
import Link from "next/link";

export default async function ChaptersPage() {
  const session = await userService.getUserSession();
  const role = (session?.user as any)?.role?.toLowerCase() ?? "";
  const canUpload = ["creator", "admin", "moderator"].includes(role);

  const fetchParams: any = { limit: 100 };
  if (role === "creator" && session?.user?.id) {
    fetchParams.creatorId = session.user.id;
  }

  const res = await chapterService.getAllChapters(fetchParams);
  const chapters = res?.data || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chapter Management</h1>
          <p className="text-sm text-muted-foreground">Upload and organize chapter content.</p>
        </div>
        {canUpload && (
          <Link href="/dashboard/chapters/add">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
              <Upload className="w-4 h-4" />
              Upload Chapter
            </button>
          </Link>
        )}
      </div>

      <ChaptersTable initialChapters={chapters} userRole={role} />
    </div>
  );
}
