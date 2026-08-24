"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Palette, Sparkles, User as UserIcon } from "lucide-react";

interface TopCreatorsLeaderboardProps {
  topCreatorsList: Array<{
    id: string;
    channelName: string;
    userName: string;
    userEmail?: string;
    userImage?: string | null;
    totalEarnings: number;
    withdrawnAmount: number;
    seriesCount: number;
  }>;
}

export function TopCreatorsLeaderboard({
  topCreatorsList,
}: TopCreatorsLeaderboardProps) {
  return (
    <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-white">
            <Palette className="w-5 h-5 text-pink-400" /> Top Creator Studios Leaderboard
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Most active creator channels ranked by lifetime points earnings and catalog size.
          </p>
        </div>
        <Link
          href="/dashboard/creators"
          className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
        >
          <span>View All Creators</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 text-[10px] uppercase font-bold text-muted-foreground border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Rank & Studio</th>
              <th className="px-4 py-3 text-center">Active Series</th>
              <th className="px-4 py-3 text-center">Total Earnings</th>
              <th className="px-4 py-3 text-center">Withdrawn</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {topCreatorsList.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                  No creators registered yet.
                </td>
              </tr>
            ) : (
              topCreatorsList.map((c, idx) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-white/10 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs overflow-hidden shrink-0">
                        {c.userImage ? (
                          <img src={c.userImage} alt={c.channelName} className="w-full h-full object-cover" />
                        ) : (
                          c.channelName.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate max-w-[180px]">
                          {c.channelName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{c.userName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-semibold">{c.seriesCount} titles</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-emerald-400">
                    {c.totalEarnings.toLocaleString()} P
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-medium text-muted-foreground">
                    {c.withdrawnAmount.toLocaleString()} P
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/channel/${c.id}`}
                      target="_blank"
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-primary font-semibold text-[11px] border border-white/10 transition inline-flex items-center gap-1"
                    >
                      <span>Channel</span>
                      <ExternalLink className="w-3 h-3" />
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
