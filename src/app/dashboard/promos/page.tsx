"use client";

import { useState } from "react";
import {
  useGetPromoCodesQuery,
  useCreatePromoCodeMutation,
  useDeletePromoCodeMutation,
} from "@/redux/api/promoApi";
import {
  Gift, Plus, Trash2, Copy, Check, Users, Sparkles, Loader2, Calendar, AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

export default function PromoCodesDashboardPage() {
  const { data: promoData, isLoading } = useGetPromoCodesQuery();
  const [createPromoMutate, { isLoading: creating }] = useCreatePromoCodeMutation();
  const [deletePromoMutate] = useDeletePromoCodeMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [pointsReward, setPointsReward] = useState("50");
  const [maxUses, setMaxUses] = useState("100");
  const [expiresAt, setExpiresAt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const promos = promoData?.data || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Promo code is required");
      return;
    }

    try {
      await createPromoMutate({
        code: code.trim(),
        pointsReward: Number(pointsReward) || 0,
        maxUses: Number(maxUses) || 100,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      }).unwrap();

      toast.success("Promo code created successfully!");
      setModalOpen(false);
      setCode("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create promo code");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    try {
      await deletePromoMutate(id).unwrap();
      toast.success("Promo code deleted");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete promo code");
    }
  };

  const handleCopy = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    toast.success(`Copied "${codeText}" to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let res = "";
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(res);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" /> Promo & Coupon Codes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create reward promo codes for your channel followers, Discord community, and marketing campaigns.
          </p>
        </div>
        <button
          onClick={() => {
            generateRandomCode();
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Promo Code
        </button>
      </div>

      {/* Promos List Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : promos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-4 px-6">Promo Code</th>
                  <th className="py-4 px-6">Reward (Points)</th>
                  <th className="py-4 px-6">Redemptions</th>
                  <th className="py-4 px-6">Expiry</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {promos.map((promo) => {
                  const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date();
                  const isFull = promo.usedCount >= promo.maxUses;

                  return (
                    <tr key={promo.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-4 px-6 font-mono font-bold text-white flex items-center gap-2">
                        <span>{promo.code}</span>
                        <button
                          onClick={() => handleCopy(promo.code, promo.id)}
                          className="text-white/40 hover:text-white transition p-1"
                          title="Copy Code"
                        >
                          {copiedId === promo.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 font-bold text-amber-400">
                        +{promo.pointsReward} pts
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{promo.usedCount}</span>
                          <span className="text-white/40">/ {promo.maxUses}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-muted-foreground">
                        {promo.expiresAt
                          ? format(new Date(promo.expiresAt), "MMM dd, yyyy")
                          : "Never"}
                      </td>
                      <td className="py-4 px-6">
                        {isExpired ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            EXPIRED
                          </span>
                        ) : isFull ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            FULL
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                          title="Delete Code"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground text-sm">
            No promo codes created yet. Click "Create Promo Code" to get started!
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 max-w-md w-full shadow-2xl relative">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white">
              <Sparkles className="w-5 h-5 text-primary" /> Create Promo Code
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Promo Code Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SUMMER50"
                    required
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white font-mono font-bold tracking-wider uppercase"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3 py-2 glass rounded-xl text-xs font-bold text-white/70 hover:text-white"
                  >
                    Random
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Points Reward
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={pointsReward}
                    onChange={(e) => setPointsReward(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 glass rounded-xl text-sm font-semibold text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !code.trim()}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
