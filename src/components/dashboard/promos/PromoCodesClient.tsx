"use client";

import { useState } from "react";
import { promoService, PromoCode } from "@/services/promo.service";
import { CreatePromoCodeAction, DeletePromoCodeAction } from "@/actions/promo";
import {
  Gift, Plus, Trash2, Copy, Check, Sparkles, Loader2, AlertCircle, Clock
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format, isPast } from "date-fns";
import { PaginationFooter } from "@/components/dashboard/PaginationFooter";

interface PromoCodesClientProps {
  initialPromos?: PromoCode[];
}

export function PromoCodesClient({ initialPromos = [] }: PromoCodesClientProps) {
  const [promos, setPromos] = useState<PromoCode[]>(initialPromos);
  const [isLoading, setIsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [pointsReward, setPointsReward] = useState("50");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [maxUses, setMaxUses] = useState("100");
  const [expiresAt, setExpiresAt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPromos = async () => {
    setIsLoading(true);
    try {
      const res = await promoService.getPromoCodes();
      if (res.success && res.data) {
        setPromos(res.data);
      }
    } catch (_err) {
      toast.error("Failed to load promo codes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Promo code is required");
      return;
    }

    setCreating(true);
    try {
      const res = await CreatePromoCodeAction({
        code: code.trim(),
        pointsReward: Number(pointsReward) || 0,
        discountPercent: Number(discountPercent) || 0,
        maxUses: Number(maxUses) || 100,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      });

      if (res.success) {
        toast.success("Promo code created successfully!");
        setModalOpen(false);
        setCode("");
        setPointsReward("50");
        setDiscountPercent("0");
        setMaxUses("100");
        setExpiresAt("");
        fetchPromos();
      } else {
        toast.error(res.message || "Failed to create promo code");
      }
    } catch (_err) {
      toast.error("Failed to create promo code");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    setDeletingId(id);
    try {
      const res = await DeletePromoCodeAction(id);
      if (res.success) {
        toast.success("Promo code deleted");
        fetchPromos();
      } else {
        toast.error(res.message || "Failed to delete promo code");
      }
    } catch (_err) {
      toast.error("Failed to delete promo code");
    } finally {
      setDeletingId(null);
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

  const totalPages = Math.ceil(promos.length / itemsPerPage) || 1;
  const paginatedPromos = promos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Gift className="w-6 h-6 text-primary" /> Promo Codes & Vouchers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create promotional codes granting free reader points or bulk reading discounts.
          </p>
        </div>

        <button
          onClick={() => {
            generateRandomCode();
            setModalOpen(true);
          }}
          className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Promo Code
        </button>
      </div>

      {/* Promos Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : promos.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] border-b border-white/5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Code</th>
                    <th className="py-4 px-6">Type / Reward</th>
                    <th className="py-4 px-6">Redemptions</th>
                    <th className="py-4 px-6">Expiry Time</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedPromos.map((promo) => {
                    const isExpired = promo.expiresAt && isPast(new Date(promo.expiresAt));
                    const isFull = promo.usedCount >= promo.maxUses;

                    return (
                      <tr key={promo.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-6 font-mono font-bold text-white flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">{promo.code}</span>
                          <button
                            onClick={() => handleCopy(promo.code, promo.id)}
                            className="text-white/40 hover:text-white transition p-1 cursor-pointer"
                            title="Copy Code"
                          >
                            {copiedId === promo.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 flex-wrap">
                            {promo.pointsReward > 0 && (
                              <span className="font-bold text-amber-400 text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                                +{promo.pointsReward} Points
                              </span>
                            )}
                            {promo.discountPercent > 0 && (
                              <span className="font-bold text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                {promo.discountPercent}% Off Bulk
                              </span>
                            )}
                            {promo.pointsReward === 0 && promo.discountPercent === 0 && (
                              <span className="text-muted-foreground text-xs">Standard</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{promo.usedCount}</span>
                            <span className="text-white/40">/ {promo.maxUses}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-muted-foreground">
                          {promo.expiresAt ? (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-white/40" />
                              <span>{format(new Date(promo.expiresAt), "MMM dd, yyyy HH:mm")}</span>
                            </div>
                          ) : (
                            <span className="text-emerald-400 font-medium">No Expiration</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {isExpired ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                              EXPIRED
                            </span>
                          ) : isFull ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                              LIMIT REACHED
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
                            disabled={deletingId === promo.id}
                            className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition cursor-pointer disabled:opacity-50"
                            title="Delete Code"
                          >
                            {deletingId === promo.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="border-t border-white/5 px-4 bg-white/[0.01]">
              <PaginationFooter
                page={currentPage}
                totalPages={totalPages}
                totalItems={promos.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground text-sm">
            No promo codes created yet. Click &quot;Create Promo Code&quot; to get started!
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
                  Promo Code *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="FLASH50"
                    required
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white font-mono font-bold tracking-wider uppercase"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3 py-2 glass rounded-xl text-xs font-bold text-white/70 hover:text-white cursor-pointer"
                  >
                    Random
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Points Reward (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={pointsReward}
                    onChange={(e) => setPointsReward(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Bulk Discount % (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white text-sm"
                  />
                </div>
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center justify-between">
                  <span>Expiry Date & Time (Optional)</span>
                  <span className="text-[10px] text-primary lowercase">Limited Time Control</span>
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 glass rounded-xl text-sm font-semibold text-white/70 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !code.trim()}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Promo Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
