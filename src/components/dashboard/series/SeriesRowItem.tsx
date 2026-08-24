"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Layers,
  Plus,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { UnifiedSeriesItem } from "./SeriesClient";

interface SeriesRowItemProps {
  item: UnifiedSeriesItem;
  isModOrAdmin: boolean;
  onToggleFeatured: (id: string) => void;
  onRequestFeature: (item: UnifiedSeriesItem) => void;
  onOpenHideModal: (item: UnifiedSeriesItem) => void;
  onOpenDeleteDialog: (item: UnifiedSeriesItem) => void;
}

export function SeriesRowItem({
  item,
  isModOrAdmin,
  onToggleFeatured,
  onRequestFeature,
  onOpenHideModal,
  onOpenDeleteDialog,
}: SeriesRowItemProps) {
  return (
    <tr className="hover:bg-white/[0.02] transition group">
      {/* Series Title & Cover */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3 max-w-xs">
          <div className="w-10 h-14 rounded-lg bg-white/10 overflow-hidden shrink-0 border border-white/10 shadow-sm relative group-hover:border-primary/40 transition-colors">
            {item.coverUrl ? (
              <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30">📖</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate group-hover:text-primary transition-colors">
              {item.title}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono truncate">/{item.slug}</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-semibold uppercase">
                {item.type}
              </span>
              {item.genres?.slice(0, 2).map((g) => (
                <span key={g.id} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </td>

      {/* Creator Info (for Admin / Mod) */}
      {isModOrAdmin && (
        <td className="px-4 py-3.5 text-muted-foreground">
          {item.creator ? (
            <div className="max-w-[160px]">
              <p className="font-semibold text-white/90 truncate">
                {item.creator.channelName || item.creator.name || "Creator"}
              </p>
              {item.creator.email && (
                <p className="text-[10px] text-white/50 truncate font-mono">{item.creator.email}</p>
              )}
            </div>
          ) : (
            <span className="text-white/40 italic">Platform / Official</span>
          )}
        </td>
      )}

      {/* Chapters */}
      <td className="px-4 py-3.5">
        <span className="font-bold text-white text-sm">{item._count?.chapters || 0}</span>
        <span className="text-[10px] text-muted-foreground block">chapters</span>
      </td>

      {/* Views & Rating */}
      <td className="px-4 py-3.5">
        <p className="text-white font-medium flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-muted-foreground" /> {(item.totalViews || 0).toLocaleString()}
        </p>
        <p className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
          <Star className="w-3 h-3 fill-amber-400" /> {(item.rating || 0).toFixed(1)}
        </p>
      </td>

      {/* Status Badge */}
      <td className="px-4 py-3.5">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            item.status === "ONGOING"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : item.status === "COMPLETED"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          }`}
        >
          {item.status}
        </span>
      </td>

      {/* Promotion / Featured Column */}
      <td className="px-4 py-3.5">
        {isModOrAdmin ? (
          <button
            onClick={() => onToggleFeatured(item.id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              item.featured
                ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/30 shadow-sm"
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/10"
            }`}
            title={item.featured ? "Click to unfeature from homepage" : "Click to directly feature on homepage"}
          >
            <Star className={`w-3.5 h-3.5 ${item.featured ? "fill-current text-yellow-400" : ""}`} />
            <span>{item.featured ? "Featured" : "Not Featured"}</span>
          </button>
        ) : item.featured ? (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 shadow-sm"
            title="This series is currently featured on the homepage"
          >
            <Star className="w-3.5 h-3.5 fill-current text-yellow-400" /> Featured
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onRequestFeature(item)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-muted-foreground bg-white/5 hover:bg-yellow-400/10 hover:text-yellow-400 border border-white/10 hover:border-yellow-400/30 transition-all group/btn cursor-pointer"
            title="Request featured placement on homepage for author points"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400/70 group-hover/btn:text-yellow-400" />
            <span>Request Feature</span>
          </button>
        )}
      </td>

      {/* Visibility Column (for Staff) */}
      {isModOrAdmin && (
        <td className="px-4 py-3.5">
          {item.isHidden ? (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                <EyeOff className="w-3 h-3" /> HIDDEN
              </span>
              {item.hiddenReason && (
                <p className="text-[10px] text-red-300/80 line-clamp-1 max-w-[140px]" title={item.hiddenReason}>
                  {item.hiddenReason}
                </p>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Eye className="w-3 h-3" /> Visible
            </span>
          )}
        </td>
      )}

      {/* Actions Toolbar */}
      <td className="px-5 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {/* Staff Hide / Restore Button */}
          {isModOrAdmin && (
            <button
              onClick={() => onOpenHideModal(item)}
              className={`p-2 rounded-lg transition cursor-pointer ${
                item.isHidden
                  ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                  : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
              }`}
              title={item.isHidden ? "Restore / Unhide series" : "Hide series from public"}
            >
              {item.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          )}

          <Link
            href={`/dashboard/chapters/add?seriesId=${item.id}`}
            className="p-2 rounded-lg glass glass-hover text-emerald-400/80 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
            title="Add New Chapter"
          >
            <Plus className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={`/dashboard/series/${item.id}/analytics`}
            className="p-2 rounded-lg glass glass-hover text-cyan-400/80 hover:text-cyan-400 hover:bg-cyan-500/10 transition"
            title="View Series Analytics & Diagnostics"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={`/dashboard/series/${item.id}`}
            className="p-2 rounded-lg glass glass-hover text-purple-400/80 hover:text-purple-400 hover:bg-purple-500/10 transition"
            title="Manage Series & Chapters"
          >
            <Layers className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={`/dashboard/series/edit/${item.id}`}
            className="p-2 rounded-lg glass glass-hover text-primary/80 hover:text-primary hover:bg-primary/10 transition"
            title="Edit Series Details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={`/series/${item.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg glass glass-hover text-white/50 hover:text-white transition"
            title="Open Public Reader View"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => onOpenDeleteDialog(item)}
            className="p-2 rounded-lg glass glass-hover text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
            title="Delete Series"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
