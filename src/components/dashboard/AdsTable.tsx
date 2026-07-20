"use client";

import { DataTable } from "@/components/dashboard/DataTable";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Edit, Play, Pause, Plus, X, Loader2, Monitor, Video, Share2, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

interface CustomAd {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  videoUrl?: string;
  adType: "BANNER" | "VIDEO" | "SOCIAL";
  socialPlatform?: string;
  socialActionUrl?: string;
  points: number;
  isActive: boolean;
  targetCountries: string[];
  createdAt: string;
}

const defaultForm = {
  title: "",
  imageUrl: "",
  linkUrl: "",
  videoUrl: "",
  adType: "BANNER" as "BANNER" | "VIDEO" | "SOCIAL",
  socialPlatform: "",
  socialActionUrl: "",
  points: 10,
  isActive: true,
  targetCountries: [] as string[],
};

export function AdsTable() {
  const [ads, setAds] = useState<CustomAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editAd, setEditAd] = useState<CustomAd | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [countriesInput, setCountriesInput] = useState("");

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ads");
      setAds(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch ads", err);
      toast.error("Failed to load custom ads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const openCreate = () => {
    setEditAd(null);
    setForm(defaultForm);
    setCountriesInput("");
    setShowModal(true);
  };

  const openEdit = (ad: CustomAd) => {
    setEditAd(ad);
    setForm({
      title: ad.title,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      videoUrl: ad.videoUrl || "",
      adType: ad.adType,
      socialPlatform: ad.socialPlatform || "",
      socialActionUrl: ad.socialActionUrl || "",
      points: ad.points,
      isActive: ad.isActive,
      targetCountries: ad.targetCountries,
    });
    setCountriesInput(ad.targetCountries.join(", "));
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        targetCountries: countriesInput ? countriesInput.split(",").map(c => c.trim().toUpperCase()).filter(Boolean) : [],
        videoUrl: form.videoUrl || undefined,
        socialPlatform: form.socialPlatform || undefined,
        socialActionUrl: form.socialActionUrl || undefined,
      };

      if (editAd) {
        await api.put(`/ads/${editAd.id}`, payload);
        toast.success("Ad updated successfully!");
      } else {
        await api.post("/ads", payload);
        toast.success("Ad created successfully!");
      }
      setShowModal(false);
      fetchAds();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save ad");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (ad: CustomAd) => {
    try {
      await api.put(`/ads/${ad.id}`, { isActive: !ad.isActive });
      toast.success(`Ad ${!ad.isActive ? "activated" : "paused"}`);
      fetchAds();
    } catch {
      toast.error("Failed to update ad status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ad? This cannot be undone.")) return;
    try {
      await api.delete(`/ads/${id}`);
      toast.success("Ad deleted");
      fetchAds();
    } catch {
      toast.error("Failed to delete ad");
    }
  };

  const filteredAds = ads.filter(a =>
    (a.title?.toLowerCase().includes(search.toLowerCase()) || a.linkUrl.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === "ALL" || (statusFilter === "ACTIVE" ? a.isActive : !a.isActive))
  );

  const adTypeIcon = (type: string) => {
    if (type === "VIDEO") return <Video className="w-3.5 h-3.5 text-blue-400" />;
    if (type === "SOCIAL") return <Share2 className="w-3.5 h-3.5 text-purple-400" />;
    return <Monitor className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="glass p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search by title or link..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-background/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
        </select>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Create Ad
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          data={filteredAds}
          columns={[
            {
              header: "Ad",
              accessor: (item: CustomAd) => (
                <div className="flex items-center gap-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-white text-sm">{item.title || "Untitled Ad"}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{item.linkUrl}</p>
                  </div>
                </div>
              ),
            },
            {
              header: "Type",
              accessor: (item: CustomAd) => (
                <div className="flex items-center gap-1.5">
                  {adTypeIcon(item.adType)}
                  <span className="text-xs font-medium">{item.adType}</span>
                  {item.socialPlatform && <span className="text-xs text-muted-foreground">({item.socialPlatform})</span>}
                </div>
              ),
            },
            {
              header: "Points",
              accessor: (item: CustomAd) => (
                <span className="text-primary font-bold text-sm">{item.points}</span>
              ),
            },
            {
              header: "Countries",
              accessor: (item: CustomAd) => (
                <span className="text-xs text-muted-foreground">
                  {item.targetCountries.length === 0 ? "All" : item.targetCountries.join(", ")}
                </span>
              ),
            },
            {
              header: "Status",
              accessor: (item: CustomAd) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  item.isActive
                    ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                    : "text-orange-400 bg-orange-400/10 border border-orange-400/20"
                }`}>
                  {item.isActive ? "Active" : "Paused"}
                </span>
              ),
            },
            {
              header: "Actions",
              accessor: (item: CustomAd) => (
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleToggle(item)}
                    className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-muted-foreground"
                    title={item.isActive ? "Pause" : "Activate"}
                  >
                    {item.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-colors text-muted-foreground"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-muted-foreground"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
              className: "text-right",
            },
          ]}
        />
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => !saving && setShowModal(false)}
          />
          <div className="relative glass border border-white/10 rounded-3xl w-full max-w-xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editAd ? "Edit Ad" : "Create Custom Ad"}</h2>
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="p-1 hover:bg-white/10 rounded-full transition text-muted-foreground hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Ad Type */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">Ad Type</label>
                <div className="flex gap-2">
                  {["BANNER", "VIDEO", "SOCIAL"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, adType: type as any })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                        form.adType === type
                          ? "bg-primary text-white border-primary"
                          : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ad title (internal label)"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white text-sm placeholder:text-muted-foreground"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Image URL (Banner/Thumbnail)</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white text-sm placeholder:text-muted-foreground"
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  {form.adType === "SOCIAL" ? "Social Page URL (to verify subscription)" : "Destination URL (click target)"}
                </label>
                <input
                  type="url"
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  placeholder="https://..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white text-sm placeholder:text-muted-foreground"
                />
              </div>

              {/* Video URL (only for VIDEO type) */}
              {form.adType === "VIDEO" && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Video URL (mp4 or YouTube embed)</label>
                  <input
                    type="url"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    placeholder="https://example.com/video.mp4"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white text-sm placeholder:text-muted-foreground"
                  />
                </div>
              )}

              {/* Social Platform (only for SOCIAL type) */}
              {form.adType === "SOCIAL" && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Social Platform</label>
                  <select
                    value={form.socialPlatform}
                    onChange={(e) => setForm({ ...form, socialPlatform: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white text-sm"
                  >
                    <option value="" className="bg-neutral-900">Select platform...</option>
                    <option value="youtube" className="bg-neutral-900">YouTube (Subscribe)</option>
                    <option value="instagram" className="bg-neutral-900">Instagram (Follow)</option>
                    <option value="facebook" className="bg-neutral-900">Facebook (Follow/Like)</option>
                  </select>
                </div>
              )}

              {/* Points reward */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Reward Points</label>
                <input
                  type="number"
                  value={form.points}
                  min={1}
                  onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white text-sm"
                />
              </div>

              {/* Target Countries */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Target Countries (comma-separated ISO codes, e.g. BD, US, GB)</label>
                <input
                  type="text"
                  value={countriesInput}
                  onChange={(e) => setCountriesInput(e.target.value)}
                  placeholder="Leave empty to target all countries"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white text-sm placeholder:text-muted-foreground"
                />
              </div>

              {/* Active status */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${form.isActive ? "bg-primary" : "bg-white/20"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
                </div>
                <span className="text-sm text-white font-medium">
                  {form.isActive ? "Active (visible to users)" : "Paused (hidden from users)"}
                </span>
              </label>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : editAd ? "Update Ad" : "Create Ad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
