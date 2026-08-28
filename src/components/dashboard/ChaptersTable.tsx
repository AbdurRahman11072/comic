"use client";

import { DataTable } from "@/components/dashboard/DataTable";
import { Input } from "@/components/ui/input";
import { Edit2, Eye, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DeleteChapterAction } from "@/actions/chapter";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface ChaptersTableProps {
  initialChapters: any[];
  userRole?: string;
}

export function ChaptersTable({ initialChapters, userRole }: ChaptersTableProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const router = useRouter();
  const canModify = ["creator", "admin", "moderator"].includes(userRole?.toLowerCase() || "");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    try {
      const res = await DeleteChapterAction(id);
      if (res.success) {
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete chapter.");
      }
    } catch (error) {
      console.error("Failed to delete chapter:", error);
      toast.error("Failed to delete chapter.");
    }
  };

  const filteredChapters = initialChapters.filter(c => 
    c.series?.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    c.title?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="glass p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10" 
            placeholder="Search by series or chapter..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable 
        data={filteredChapters}
        columns={[
          { header: "Series", accessor: (item: any) => item.series?.title || "Unknown", className: "font-bold" },
          { header: "Chapter", accessor: (item: any) => `Chapter ${item.number}${item.title ? `: ${item.title}` : ""}` },
          { 
            header: "Language", 
            accessor: (item: any) => {
              const langCode = (item.language || "en").toLowerCase();
              const badge =
                langCode === "bn"
                  ? { flag: "🇧🇩", label: "Bangla", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" }
                  : langCode === "es"
                  ? { flag: "🇪🇸", label: "Spanish", cls: "bg-amber-500/10 text-amber-400 border-amber-500/25" }
                  : langCode === "hi"
                  ? { flag: "🇮🇳", label: "Hindi", cls: "bg-orange-500/10 text-orange-400 border-orange-500/25" }
                  : langCode === "ar"
                  ? { flag: "🇸🇦", label: "Arabic", cls: "bg-teal-500/10 text-teal-400 border-teal-500/25" }
                  : langCode === "id"
                  ? { flag: "🇮🇩", label: "Indonesian", cls: "bg-rose-500/10 text-rose-400 border-rose-500/25" }
                  : { flag: "🇬🇧", label: "English", cls: "bg-blue-500/10 text-blue-400 border-blue-500/25" };

              return (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5 ${badge.cls}`}>
                  <span>{badge.flag}</span>
                  <span>{badge.label}</span>
                </span>
              );
            }
          },
          { header: "Coin Cost", accessor: (item: any) => item.coinCost > 0 ? `${item.coinCost} Coins` : "Free", className: "text-primary font-bold" },
          { header: "Published", accessor: (item: any) => new Date(item.createdAt).toLocaleDateString(), className: "text-muted-foreground" },
          { 
            header: "Actions", 
            accessor: (item: any) => (
              <div className="flex items-center justify-end gap-2">
                <Link href={`/series/${item.series?.slug}/${item.number}?lang=${item.language || "en"}`} className="p-2 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </Link>
                {canModify && (
                  <>
                    <Link href={`/dashboard/chapters/edit/${item.id}`} className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ),
            className: "text-right"
          }
        ]}
      />
    </div>
  );
}
