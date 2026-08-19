"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  ExternalLink, 
  BarChart3, 
  Calendar, 
  Coins, 
  Lock, 
  Zap, 
  Search, 
  ArrowLeft, 
  Image as ImageIcon,
  Sparkles,
  Layers,
  Heart,
  Star,
  Users,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteChapterAction } from "@/actions/chapter";
import { toast } from "react-hot-toast";

interface SeriesDetailsViewProps {
  series: any;
  userRole?: string;
}

export function SeriesDetailsView({ series, userRole }: SeriesDetailsViewProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!series) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Series Not Found</h2>
        <p className="text-sm text-muted-foreground">The series you requested does not exist or has been deleted.</p>
        <Link href="/dashboard/series">
          <Button variant="secondary" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Series Management
          </Button>
        </Link>
      </div>
    );
  }

  const chapters: any[] = series.chapters || [];

  const filteredChapters = chapters.filter((c) => {
    const matchNumber = String(c.number).includes(searchTerm.trim());
    const matchTitle = (c.title || "").toLowerCase().includes(searchTerm.toLowerCase().trim());
    return matchNumber || matchTitle;
  });

  const handleDeleteChapter = async (id: string, num: number) => {
    if (!confirm(`Are you sure you want to delete Chapter ${num}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await DeleteChapterAction(id);
      if (res.success) {
        toast.success(`Chapter ${num} deleted successfully!`);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete chapter.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete chapter.");
    } finally {
      setDeletingId(null);
    }
  };

  const authorName = typeof series.author === "string" ? series.author : series.author?.name || null;
  const artistName = typeof series.artist === "string" ? series.artist : series.artist?.name || null;
  const seriesType = typeof series.type === "string" ? series.type : series.type?.name || "MANHWA";
  const seriesStatus = typeof series.status === "string" ? series.status : series.status?.name || "ONGOING";

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/dashboard/series">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Series
          </Button>
        </Link>

        <div className="flex items-center gap-2.5">
          <Link href={`/dashboard/series/${series.id}/analytics`}>
            <Button variant="outline" size="sm" className="text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-xl h-9">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Diagnostics & Analytics
            </Button>
          </Link>
          <Link href={`/dashboard/series/edit/${series.id}`}>
            <Button variant="outline" size="sm" className="text-xs border-white/10 hover:bg-white/5 rounded-xl h-9">
              <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Series
            </Button>
          </Link>
          <Link href={`/series/${series.slug}`} target="_blank">
            <Button variant="secondary" size="sm" className="text-xs bg-white/10 hover:bg-white/15 rounded-xl h-9">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Public Page
            </Button>
          </Link>
          <Link href={`/dashboard/chapters/add?seriesId=${series.id}`}>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 text-xs rounded-xl h-9 px-4">
              <Plus className="w-4 h-4 mr-1" /> Upload Chapter
            </Button>
          </Link>
        </div>
      </div>

      {/* Series Hero Overview Card */}
      <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 bg-neutral-900/40 backdrop-blur-xl">
        <div className="grid gap-6 md:grid-cols-12 items-start">
          {/* Cover Image */}
          <div className="md:col-span-3 aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 relative">
            <img
              src={series.coverUrl || "/placeholder.jpg"}
              alt={series.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 text-white backdrop-blur-md border border-white/10">
              {seriesType}
            </div>
          </div>

          {/* Details & Metadata */}
          <div className="md:col-span-9 space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                  seriesStatus === "ONGOING" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                  seriesStatus === "COMPLETED" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                  "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}>
                  {seriesStatus}
                </span>
                {series.isAdult && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    18+ Mature
                  </span>
                )}
                {series.featured && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Featured
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white pt-1">
                {series.title}
              </h1>
              {series.altTitle && (
                <p className="text-xs text-muted-foreground italic">{series.altTitle}</p>
              )}
            </div>

            {/* Author / Artist */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {authorName && <div><span className="text-white/40">Author:</span> <span className="font-semibold text-white">{authorName}</span></div>}
              {artistName && <div><span className="text-white/40">Artist:</span> <span className="font-semibold text-white">{artistName}</span></div>}
              {series.releaseYear && <div><span className="text-white/40">Year:</span> <span className="font-semibold text-white">{series.releaseYear}</span></div>}
            </div>

            {/* Synopsis */}
            {series.description && (
              <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                {series.description}
              </p>
            )}

            {/* Genres */}
            {series.genres && series.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {series.genres.map((g: any, idx: number) => {
                  const genreName = typeof g === "string" ? g : g?.name || g?.title || "";
                  const genreKey = typeof g === "object" && g?.id ? g.id : `${genreName}-${idx}`;
                  if (!genreName) return null;
                  return (
                    <span key={genreKey} className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 border border-white/5 text-neutral-300">
                      {genreName}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Metric Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3 h-3 text-primary" /> Total Views
                </span>
                <p className="text-lg font-black text-white">
                  {(series.totalViews || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-400" /> Bookmarks
                </span>
                <p className="text-lg font-black text-white">
                  {(series._count?.bookmarks || series.bookmarksCount || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-purple-400" /> Chapters
                </span>
                <p className="text-lg font-black text-white">
                  {chapters.length}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" /> Rating
                </span>
                <p className="text-lg font-black text-amber-300">
                  {series.rating ? Number(series.rating).toFixed(1) : "5.0"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Chapter Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Manage Chapters ({chapters.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Directly upload, edit, reorder, or delete chapters for this series.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search chapter # or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs bg-background/50 border-white/10 rounded-xl"
              />
            </div>
            <Link href={`/dashboard/chapters/add?seriesId=${series.id}`}>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl h-9 shadow-md">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Chapter
              </Button>
            </Link>
          </div>
        </div>

        {/* Chapters Table */}
        <div className="glass rounded-3xl border border-white/10 overflow-hidden bg-neutral-900/40 backdrop-blur-xl">
          {filteredChapters.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-muted-foreground">
                <BookOpen className="w-6 h-6 opacity-40" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  {searchTerm ? "No chapters match your search." : "No chapters uploaded for this series yet."}
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {searchTerm ? "Try searching for a different number or title." : "Start uploading comic pages to release your first chapter to readers."}
                </p>
              </div>
              {!searchTerm && (
                <Link href={`/dashboard/chapters/add?seriesId=${series.id}`}>
                  <Button size="sm" className="bg-primary text-primary-foreground font-bold rounded-xl text-xs px-5 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-1.5" /> Upload First Chapter
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground font-semibold uppercase tracking-wider text-[10px] bg-white/[0.02]">
                    <th className="py-3.5 px-5">Chapter</th>
                    <th className="py-3.5 px-4">Title</th>
                    <th className="py-3.5 px-4">Pages</th>
                    <th className="py-3.5 px-4">Access & Cost</th>
                    <th className="py-3.5 px-4">Release Date</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredChapters.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-5 font-bold text-white">
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-black text-primary inline-block">
                          Ch. {c.number}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-neutral-300 font-medium max-w-[200px] truncate">
                        {c.title || <span className="text-muted-foreground italic">Untitled</span>}
                      </td>

                      <td className="py-4 px-4">
                        <span className="flex items-center gap-1 text-muted-foreground font-mono">
                          <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                          {c.images?.length || c._count?.images || 0} pages
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {c.isFastPass ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" /> FastPass ({c.coinCost} Coins)
                            </span>
                          ) : c.isLocked ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Locked ({c.coinCost} Coins)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Free
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-muted-foreground font-mono text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/series/${series.slug}/${c.number}`}
                            target="_blank"
                            className="p-2 hover:bg-blue-500/10 text-neutral-400 hover:text-blue-400 rounded-xl transition"
                            title="Read / Preview Chapter"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/dashboard/chapters/edit/${c.id}`}
                            className="p-2 hover:bg-primary/10 text-neutral-400 hover:text-primary rounded-xl transition"
                            title="Edit Chapter"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            disabled={deletingId === c.id}
                            onClick={() => handleDeleteChapter(c.id, c.number)}
                            className="p-2 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 rounded-xl transition disabled:opacity-40"
                            title="Delete Chapter"
                          >
                            {deletingId === c.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
