"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { DataTable } from "@/components/dashboard/DataTable";
import {
  Edit,
  Globe,
  Loader2,
  Pause,
  Play,
  Smartphone,
  Sparkles,
  Trash2,
} from "lucide-react";
import { adService, CustomAdItem, AdStats } from "@/services/ad.service";
import {
  CreateAdminAdAction,
  UpdateAdminAdAction,
  DeleteAdminAdAction,
} from "@/actions/ad";

import { AdMetricsOverview } from "./AdMetricsOverview";
import { AdFiltersToolbar } from "./AdFiltersToolbar";
import { AdFormModal } from "./AdFormModal";

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

export function AdsClient() {
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
      statusFilter === "ALL" || (statusFilter === "ACTIVE" ? a.isActive : !a.isActive);
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
      <AdMetricsOverview stats={stats} />

      {/* 2. Controls & Search Filter */}
      <AdFiltersToolbar
        search={search}
        providerFilter={providerFilter}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onProviderFilterChange={setProviderFilter}
        onStatusFilterChange={setStatusFilter}
        onOpenCreate={openCreate}
      />

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
                    <p className="font-bold text-white text-sm">
                      {item.title || "Untitled Ad Unit"}
                    </p>
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
                const ctr =
                  item.impressions > 0
                    ? ((item.clicks / item.impressions) * 100).toFixed(1)
                    : "0.0";
                return (
                  <div className="text-xs space-y-0.5">
                    <div className="text-white font-medium">
                      {item.impressions.toLocaleString()} views / {item.clicks.toLocaleString()}{" "}
                      clicks
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
                    {item.isActive ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 text-emerald-400" />
                    )}
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
      <AdFormModal
        open={showModal}
        editAd={editAd}
        form={form}
        countriesInput={countriesInput}
        saving={saving}
        onClose={() => setShowModal(false)}
        onFormChange={setForm}
        onCountriesInputChange={setCountriesInput}
        onSubmit={handleSave}
      />
    </div>
  );
}
