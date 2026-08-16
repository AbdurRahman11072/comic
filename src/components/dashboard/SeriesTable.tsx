"use client";

import { DataTable } from "@/components/dashboard/DataTable";
import { Input } from "@/components/ui/input";
import { Series } from "@/types";
import { Edit2, Eye, Filter, Search, Star, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DeleteSeriesAction, ToggleFeaturedAction } from "@/actions/series";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface SeriesTableProps {
  initialSeries: Series[];
  userRole?: string;
}

export function SeriesTable({ initialSeries, userRole }: SeriesTableProps) {
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
    if (!confirm("Are you sure you want to delete this series? All chapters will be deleted too.")) return;
    try {
      const res = await DeleteSeriesAction(id);
      if (res.success) {
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete series.");
      }
    } catch (error) {
      console.error("Failed to delete series:", error);
      toast.error("Failed to delete series. Please try again.");
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const res = await ToggleFeaturedAction(id);
      if (res.success) {
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update featured status.");
      }
    } catch (error) {
      console.error("Failed to toggle featured status:", error);
      toast.error("Failed to update featured status.");
    }
  };

  const filteredSeries = initialSeries.filter(s => 
    s.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="glass p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10" 
            placeholder="Search series..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          {/* Note: In a real app we would map options to a state, keeping the filter icon for UI consistency */}
          <button className="p-2.5 glass rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <DataTable 
        data={filteredSeries}
        columns={[
          { 
            header: "Series", 
            accessor: (item: Series) => (
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-14 bg-white/5 border border-white/10 rounded overflow-hidden bg-center bg-cover"
                  style={{ backgroundImage: `url(${item.coverUrl})` }}
                />
                <div className="font-bold truncate max-w-[200px]">{item.title}</div>
              </div>
            )
          },
          { 
            header: "Featured", 
            accessor: (item: Series) => (
              <button 
                onClick={() => canModify ? handleToggleFeatured(item.id) : null}
                className={`p-2 rounded-lg transition-all ${
                  item.featured 
                    ? "text-yellow-500 bg-yellow-500/10" 
                    : "text-muted-foreground hover:bg-white/5"
                } ${!canModify && 'opacity-50 cursor-not-allowed'}`}
                title={item.featured ? "Remove from featured" : "Add to featured"}
                disabled={!canModify}
              >
                <Star className={`w-4 h-4 ${item.featured ? "fill-current" : ""}`} />
              </button>
            )
          },
          { header: "Type", accessor: "type", className: "text-muted-foreground uppercase text-xs" },
          { 
            header: "Status", 
            accessor: (item: Series) => (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                item.status === "ONGOING" ? "text-blue-400 bg-blue-400/10" : "text-green-400 bg-green-400/10"
              }`}>
                {item.status}
              </span>
            )
          },
          { header: "Chapters", accessor: (item: Series) => item._count?.chapters || 0 },
          { 
            header: "Actions", 
            accessor: (item: Series) => (
              <div className="flex items-center justify-end gap-1">
                {canModify && (
                  <Link href={`/dashboard/chapters/add?seriesId=${item.id}`} className="p-2 hover:bg-green-500/10 hover:text-green-500 rounded-lg transition-colors" title="Add Chapter">
                    <Plus className="w-4 h-4" />
                  </Link>
                )}
                <Link href={`/series/${item.slug}`} className="p-2 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-colors" title="View Series">
                  <Eye className="w-4 h-4" />
                </Link>
                {canModify && (
                  <>
                    <Link href={`/dashboard/series/edit/${item.id}`} className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors" title="Edit Series">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                      title="Delete Series"
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
