"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { creatorService, PublicChannelData } from "@/services/creator.service";
import { useRedeemPromoCodeMutation } from "@/redux/api/promoApi";
import {
  BookOpen, Star, Eye, Bookmark, Gift, MessageSquare,
  Pin, Calendar, CheckCircle2, Loader2, Sparkles
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

export function ChannelClient({ channelId }: { channelId: string }) {
  const [profile, setProfile] = useState<PublicChannelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [redeemMutate, { isLoading: redeeming }] = useRedeemPromoCodeMutation();
  const [activeTab, setActiveTab] = useState<"series" | "announcements" | "promos">("series");

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);
    creatorService.getPublicChannel(channelId).then((res) => {
      if (isMounted) {
        if (res.success && res.data) {
          setProfile(res.data);
        } else {
          setIsError(true);
        }
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [channelId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl font-bold mb-2">Creator Channel Not Found</h2>
          <p className="text-muted-foreground text-sm mb-6">
            The creator channel you are looking for does not exist or has been removed.
          </p>
          <Link href="/series" className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold">
            Browse All Series
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const user = profile.user;
  const seriesList = profile.series || [];
  const posts = user?.creatorPosts || [];
  const promos = user?.createdPromoCodes || [];

  const handleCopyCode = async (code: string) => {
    try {
      const res = await redeemMutate({ code }).unwrap();
      toast.success(`🎉 Redeemed code ${code}! Added ${res.data.pointsAwarded} points.`);
    } catch (err: any) {
      navigator.clipboard.writeText(code);
      toast.error(err?.data?.message || "Copied code to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/30">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Banner Section */}
        <div className="relative h-64 md:h-80 w-full bg-neutral-900 overflow-hidden">
          {profile.bannerUrl && (
            <img
              src={profile.bannerUrl || ""}
              alt={profile.channelName}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        {/* Channel Info Header */}
        <div className="max-w-[72rem] mx-auto px-4 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
            <div className="flex items-end gap-5">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl border-4 border-background bg-neutral-900 overflow-hidden shrink-0 shadow-2xl">
                {profile.profileImage || user.image ? (
                  <img
                    src={profile.profileImage || user.image || ""}
                    alt={profile.channelName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white/40">
                    {profile.channelName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                    {profile.channelName}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                    CREATOR
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl line-clamp-2">
                  {profile.description || "Official Creator Channel on Comic BD"}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
                  <span>{seriesList.length} Series</span>
                  <span>•</span>
                  <span>{posts.length} Announcements</span>
                  <span>•</span>
                  <span>Joined {new Date(user.createdAt).getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 mt-6 border-b border-white/5 pb-4">
            <button
              onClick={() => setActiveTab("series")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === "series"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "glass glass-hover text-white/70 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" /> Series ({seriesList.length})
            </button>
            <button
              onClick={() => setActiveTab("announcements")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === "announcements"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "glass glass-hover text-white/70 hover:text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Announcements ({posts.length})
            </button>
            {promos.length > 0 && (
              <button
                onClick={() => setActiveTab("promos")}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  activeTab === "promos"
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "glass glass-hover text-white/70 hover:text-white"
                }`}
              >
                <Gift className="w-4 h-4 text-amber-400" /> Channel Coupons ({promos.length})
              </button>
            )}
          </div>

          {/* Tab Content: Series */}
          {activeTab === "series" && (
            <div className="mt-8">
              {seriesList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {seriesList.map((series: any) => (
                    <Link
                      key={series.id}
                      href={`/series/${series.slug}`}
                      className="group relative flex flex-col rounded-2xl glass border border-white/5 overflow-hidden hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-900 relative">
                        {series.coverUrl ? (
                          <img
                            src={series.coverUrl}
                            alt={series.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            No Cover
                          </div>
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
                          {series.type}
                        </div>
                      </div>
                      <div className="p-3.5 flex flex-col justify-between flex-1">
                        <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-primary transition-colors">
                          {series.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-white/50 mt-2">
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {series.rating > 0 ? series.rating.toFixed(1) : "New"}
                          </span>
                          <span>{series._count?.chapters || 0} Chs</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 glass rounded-3xl border border-white/5 text-white/50 text-sm">
                  This creator has not published any series yet.
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Announcements */}
          {activeTab === "announcements" && (
            <div className="mt-8 max-w-3xl space-y-6">
              {posts.length > 0 ? (
                posts.map((post: any) => (
                  <div
                    key={post.id}
                    className={`glass p-6 rounded-2xl border transition-all ${
                      post.isPinned ? "border-primary/40 bg-primary/5" : "border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {post.isPinned && (
                          <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-bold flex items-center gap-1">
                            <Pin className="w-3 h-3" /> PINNED
                          </span>
                        )}
                        <h3 className="font-bold text-lg text-white">{post.title}</h3>
                      </div>
                      <span className="text-xs text-white/40 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>

                    {post.imageUrl && (
                      <div className="mt-4 rounded-xl overflow-hidden max-h-96 border border-white/10">
                        <img src={post.imageUrl} alt="Post asset" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20 glass rounded-3xl border border-white/5 text-white/50 text-sm">
                  No announcements from this creator yet.
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Promos */}
          {activeTab === "promos" && (
            <div className="mt-8 max-w-2xl space-y-4">
              {promos.map((promo: any) => (
                <div
                  key={promo.id}
                  className="glass p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Gift className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-base font-black text-amber-400 tracking-wider">
                          {promo.code}
                        </code>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300">
                          +{promo.pointsReward} Points
                        </span>
                      </div>
                      <p className="text-xs text-white/60 mt-1">
                        Use this code to earn {promo.pointsReward} free points for this creator's works!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyCode(promo.code)}
                    disabled={redeeming}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition shrink-0 shadow-lg shadow-amber-500/20"
                  >
                    Redeem Code
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
