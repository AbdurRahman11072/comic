"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, Star } from "lucide-react";

interface TopSeriesLeaderboardProps {
  topSeriesList: Array<{
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    type: string;
    status: string;
    views: number;
    bookmarks: number;
    rating: number;
    chapterCount: number;
  }>;
}

export function TopSeriesLeaderboard({ topSeriesList }: TopSeriesLeaderboardProps) {
  return (
    <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-white">
            <BookOpen className="w-5 h-5 text-primary" /> Top Performing Series Leaderboard
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Highest-read titles ranked by cumulative views, community saves, and rating.
          </p>
        </div>
        <Link
          href="/dashboard/series"
          className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
        >
          <span>View Catalog</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 text-[10px] uppercase font-bold text-muted-foreground border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Rank & Title</th>
              <th className="px-4 py-3 text-center">Format</th>
              <th className="px-4 py-3 text-center">Chapters</th>
              <th className="px-4 py-3 text-center">Views</th>
              <th className="px-4 py-3 text-center">Bookmarks</th>
              <th className="px-4 py-3 text-center">Rating</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {topSeriesList.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                  No series published yet.
                </td>
              </tr>
            ) : (
              topSeriesList.map((s, idx) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-white/10 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div
                        className="w-8 h-11 rounded-lg bg-white/5 border border-white/10 bg-center bg-cover shrink-0"
                        style={{ backgroundImage: s.coverUrl ? `url(${s.coverUrl})` : undefined }}
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/series/${s.slug}`}
                          className="font-bold text-white hover:text-primary transition truncate block max-w-[200px]"
                        >
                          {s.title}
                        </Link>
                        <span className="text-[10px] text-muted-foreground">{s.status}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-white/80">
                      {s.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-semibold">{s.chapterCount}</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-amber-400">
                    {s.views.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-pink-400">
                    {s.bookmarks.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-yellow-400 font-mono">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {s.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/series/edit/${s.id}`}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-[11px] border border-white/10 transition"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
