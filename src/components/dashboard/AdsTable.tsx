"use client";

import { DataTable } from "@/components/dashboard/DataTable";
import { Input } from "@/components/ui/input";
import {
  Search, Trash2, Edit, Play, Pause, Plus, X, Loader2,
  Monitor, Video, Share2, Globe, Sparkles, BarChart2,
  Eye, MousePointerClick, Smartphone, DollarSign, Layers
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { adService, CustomAdItem, AdStats } from "@/services/ad.service";
import {
  CreateAdminAdAction,
  UpdateAdminAdAction,
  DeleteAdminAdAction,
} from "@/actions/ad";

const defaultForm = {
  title: "",
  provider: "CUSTOM" as "CUSTOM" | "ADSENSE" | "ADMOB",
  format: "BANNER" as "BANNER" | "INTERSTITIAL" | "REWARDED" | "NATIVE",
  placement: "home_top",
  imageUrl: "",
  linkUrl: "",
  videoUrl: "",
  adType: "BANNER",
  socialPlatform: "",
  socialActionUrl: "",
  adClient: "",
  adSlotId: "",
  adUnitId: "",
  points: 10,
  isActive: true,
  status: "ACTIVE" as "ACTIVE" | "PAUSED" | "ARCHIVED",
  targetCountries: [] as string[],
};

export function AdsTable() {
  const [ads, setAds] = useState<CustomAdItem[]>([]);
  const [stats, setStats] = useState<AdStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editAd, setEditAd] = useState<CustomAdItem | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [countriesInput, setCountriesInput] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [adsRes, statsRes] = await Promise.all([
        adService.getCustomAds(),
        adService.getAdStats(),
      ]);
      if (adsRes.success && Array.isArray(adsRes.data)) {
        setAds(adsRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch ads", err);
      toast.error("Failed to load ad network configurations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditAd(null);
    setForm(defaultForm);
    setCountriesInput("");
    setShowModal(true);
  };

  const openEdit = (ad: CustomAdItem) => {
    setEditAd(ad);
    setForm({
      title: ad.title || "",
      provider: (ad.provider as any) || "CUSTOM",
      format: (ad.format as any) || "BANNER",
      placement: ad.placement || "home_top",
      imageUrl: ad.imageUrl || "",
      linkUrl: ad.linkUrl || "",
      videoUrl: ad.videoUrl || "",
      adType: ad.adType || "BANNER",
      socialPlatform: ad.socialPlatform || "",
      socialActionUrl: ad.socialActionUrl || "",
      adClient: ad.adClient || "",
      adSlotId: ad.adSlotId || "",
      adUnitId: ad.adUnitId || "",
      points: ad.points || 10,
      isActive: ad.isActive ?? true,
      status: (ad.status as any) || "ACTIVE",
      targetCountries: ad.targetCountries || [],
    });
    setCountriesInput((ad.targetCountries || []).join(", "));
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        targetCountries: countriesInput
          ? countriesInput.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean)
          : [],
        videoUrl: form.videoUrl || undefined,
        imageUrl: form.imageUrl || undefined,
        linkUrl: form.linkUrl || undefined,
        adClient: form.adClient || undefined,
        adSlotId: form.adSlotId || undefined,
        adUnitId: form.adUnitId || undefined,
        socialPlatform: form.socialPlatform || undefined,
        socialActionUrl: form.socialActionUrl || undefined,
      };

      if (editAd) {
        const res = await UpdateAdminAdAction(editAd.id, payload);
        if (res.success) {
          toast.success("Ad unit updated successfully!");
          setShowModal(false);
          fetchData();
        } else {
          toast.error(res.message || "Failed to save ad unit");
        }
      } else {
        const res = await CreateAdminAdAction(payload);
        if (res.success) {
          toast.success("Ad unit created successfully!");
          setShowModal(false);
          fetchData();
        } else {
          toast.error(res.message || "Failed to save ad unit");
        }
      }
    } catch (_err) {
      toast.error("Failed to save ad unit");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (ad: CustomAdItem) => {
    try {
      const newStatus = !ad.isActive;
      const res = await UpdateAdminAdAction(ad.id, {
        isActive: newStatus,
        status: newStatus ? "ACTIVE" : "PAUSED",
      });
      if (res.success) {
        toast.success(`Ad unit ${newStatus ? "activated" : "paused"}`);
        fetchData();
      } else {
        toast.error(res.message || "Failed to update ad status");
      }
    } catch {
      toast.error("Failed to update ad status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ad configuration? This cannot be undone.")) return;
    try {
      const ad = ads.find((a) => a.id === id);
      const res = await DeleteAdminAdAction(id, ad?.placement);
      if (res.success) {
        toast.success("Ad unit deleted");
        fetchData();
      } else {
        toast.error(res.message || "Failed to delete ad unit");
      }
    } catch {
      toast.error("Failed to delete ad unit");
    }
  };

  const filteredAds = ads.filter((a) => {
    const matchSearch =
      (a.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.placement || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.linkUrl || "").toLowerCase().includes(search.toLowerCase());
    const matchProvider = providerFilter === "ALL" || a.provider === providerFilter;
    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" ? a.isActive : !a.isActive);
    return matchSearch && matchProvider && matchStatus;
  });

  const getProviderBadge = (provider: string) => {
    if (provider === "ADSENSE") {
      return (
        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold text-[10px] border border-blue-500/20 flex items-center gap-1">
          <Globe className="w-3 h-3" /> AdSense (Web)
        </span>
      );
    }
    if (provider === "ADMOB") {
      return (
        <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 font-bold text-[10px] border border-yellow-500/20 flex items-center gap-1">
          <Smartphone className="w-3 h-3" /> AdMob (Mobile)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-bold text-[10px] border border-purple-500/20 flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> Custom Sponsor
      </span>
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. Performance Metrics Strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass p-5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-primary" /> Total Placements
            </span>
            <div className="text-2xl font-bold text-white">
              {stats.activeAds} <span className="text-xs text-muted-foreground font-normal">/ {stats.totalAds} active</span>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-blue-400" /> Impressions
            </span>
            <div className="text-2xl font-bold text-white">
              {(stats.totalImpressions || 0).toLocaleString()}
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
              <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" /> Total Clicks
            </span>
            <div className="text-2xl font-bold text-white">
              {(stats.totalClicks || 0).toLocaleString()}
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5 text-amber-400" /> Avg. CTR
            </span>
            <div className="text-2xl font-bold text-amber-400">
              {stats.avgCtr || "0.00%"}
            </div>
          </div>
        </div>
      )}

      {/* 2. Controls & Search Filter */}
      <div className="glass p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center justify-between border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search by title, placement, or link..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Provider Filter */}
          <select
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
          >
            <option value="ALL" className="bg-neutral-900">All Providers</option>
            <option value="CUSTOM" className="bg-neutral-900">Custom Direct</option>
            <option value="ADSENSE" className="bg-neutral-900">Google AdSense</option>
            <option value="ADMOB" className="bg-neutral-900">Google AdMob</option>
          </select>

          {/* Status Filter */}
          <select
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL" className="bg-neutral-900">All Status</option>
            <option value="ACTIVE" className="bg-neutral-900">Active Only</option>
            <option value="PAUSED" className="bg-neutral-900">Paused Only</option>
          </select>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Ad Unit
          </button>
        </div>
      </div>

      {/* 3. Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          data={filteredAds}
          columns={[
            {
              header: "Ad Title / Placement",
              accessor: (item: CustomAdItem) => (
                <div className="flex items-center gap-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-white text-sm">{item.title || "Untitled Ad Unit"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-mono text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                        {item.placement}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{item.format}</span>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              header: "Provider",
              accessor: (item: CustomAdItem) => getProviderBadge(item.provider),
            },
            {
              header: "Reward Points",
              accessor: (item: CustomAdItem) => (
                <span className="text-primary font-bold text-sm">+{item.points} pts</span>
              ),
            },
            {
              header: "Metrics (Imp / Click)",
              accessor: (item: CustomAdItem) => {
                const ctr = item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(1) : "0.0";
                return (
                  <div className="text-xs space-y-0.5">
                    <div className="text-white font-medium">
                      {item.impressions.toLocaleString()} views / {item.clicks.toLocaleString()} clicks
                    </div>
                    <div className="text-[10px] text-amber-400">CTR: {ctr}%</div>
                  </div>
                );
              },
            },
            {
              header: "Status",
              accessor: (item: CustomAdItem) => (
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.isActive
                      ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                      : "text-amber-400 bg-amber-400/10 border border-amber-400/20"
                  }`}
                >
                  {item.isActive ? "Active" : "Paused"}
                </span>
              ),
            },
            {
              header: "Actions",
              accessor: (item: CustomAdItem) => (
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleToggle(item)}
                    className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-muted-foreground cursor-pointer"
                    title={item.isActive ? "Pause" : "Activate"}
                  >
                    {item.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-colors text-muted-foreground cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors text-muted-foreground cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* 4. Edit / Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative glass border border-white/10 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editAd ? "Edit Ad Unit" : "Create New Ad Placement"}
                </h3>
                <p className="text-xs text-muted-foreground">Configure ad network parameters and rewards</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title & Placement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Campaign / Unit Title</label>
                  <Input
                    required
                    placeholder="e.g. Header Leaderboard Sponsor"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Placement Slot</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    value={form.placement}
                    onChange={(e) => setForm({ ...form, placement: e.target.value })}
                  >
                    <option value="home_top" className="bg-neutral-900">Home Top Banner</option>
                    <option value="home_bottom" className="bg-neutral-900">Home Bottom Banner</option>
                    <option value="reader_bottom" className="bg-neutral-900">Reader Bottom Banner</option>
                    <option value="reader_interstitial" className="bg-neutral-900">Reader Interstitial (Every X chapters)</option>
                    <option value="rewarded_unlock" className="bg-neutral-900">Rewarded Video (Free points / unlock)</option>
                    <option value="browse_banner" className="bg-neutral-900">Browse / Catalog Banner</option>
                  </select>
                </div>
              </div>

              {/* Provider & Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Ad Provider</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value as any })}
                  >
                    <option value="CUSTOM" className="bg-neutral-900">Custom Sponsor / Direct</option>
                    <option value="ADSENSE" className="bg-neutral-900">Google AdSense (Web)</option>
                    <option value="ADMOB" className="bg-neutral-900">Google AdMob (Mobile)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Ad Format</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value as any })}
                  >
                    <option value="BANNER" className="bg-neutral-900">Banner Display</option>
                    <option value="REWARDED" className="bg-neutral-900">Rewarded Video</option>
                    <option value="INTERSTITIAL" className="bg-neutral-900">Interstitial Full-screen</option>
                    <option value="NATIVE" className="bg-neutral-900">Native In-feed</option>
                  </select>
                </div>
              </div>

              {/* Provider Specific Settings */}
              {form.provider === "ADSENSE" && (
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-3">
                  <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> Google AdSense Configuration
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Ad Client ID</label>
                      <Input
                        placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                        value={form.adClient}
                        onChange={(e) => setForm({ ...form, adClient: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Ad Slot ID</label>
                      <Input
                        placeholder="1234567890"
                        value={form.adSlotId}
                        onChange={(e) => setForm({ ...form, adSlotId: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.provider === "ADMOB" && (
                <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 space-y-3">
                  <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> Google AdMob (React Native App)
                  </span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">AdMob Unit ID</label>
                    <Input
                      placeholder="ca-app-pub-3940256099942544/5224354917"
                      value={form.adUnitId}
                      onChange={(e) => setForm({ ...form, adUnitId: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {form.provider === "CUSTOM" && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Custom Sponsor Media
                  </span>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Banner Image URL</label>
                      <Input
                        placeholder="https://images.unsplash.com/..."
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Click-through Destination URL</label>
                      <Input
                        placeholder="https://sponsor.com/offer"
                        value={form.linkUrl}
                        onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Video URL (Optional for video ads)</label>
                      <Input
                        placeholder="https://cdn.example.com/ad.mp4"
                        value={form.videoUrl}
                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Reward Points & Country Geo-targeting */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Points Awarded on Completion</label>
                  <Input
                    type="number"
                    min={0}
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Target Countries (comma separated ISO)</label>
                  <Input
                    placeholder="e.g. US, CA, GB, BD (leave empty for Global)"
                    value={countriesInput}
                    onChange={(e) => setCountriesInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white glass cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editAd ? "Update Ad Unit" : "Save Placement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
