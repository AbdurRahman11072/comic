"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, Unlock, Sparkles, Gift, Check, Loader2, Coins, AlertCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useGetPointsBalanceQuery, useBuyBulkChaptersMutation } from "@/redux/api/pointsApi";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { LoginDialog } from "@/components/home/LoginDialog";

interface Chapter {
  id?: string;
  number: number;
  title: string;
  isLocked?: boolean;
  isPurchased?: boolean;
  coinCost?: number;
}

interface BulkUnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesTitle: string;
  chapters: Chapter[];
  onSuccess?: () => void;
}

export function BulkUnlockModal({
  open,
  onOpenChange,
  seriesTitle,
  chapters,
  onSuccess,
}: BulkUnlockModalProps) {
  const { data: session } = useSession();
  const [loginOpen, setLoginOpen] = useState(false);

  const { data: balanceData, refetch: refetchBalance } = useGetPointsBalanceQuery(undefined, {
    skip: !session,
  });
  const userPoints = balanceData?.data?.points ?? 0;

  const [buyBulkMutate, { isLoading: unlocking }] = useBuyBulkChaptersMutation();

  // Filter only locked, unpurchased chapters
  const lockedChapters = useMemo(() => {
    return chapters.filter((c) => c.isLocked && !c.isPurchased && c.id);
  }, [chapters]);

  // Selected chapter IDs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState("");

  // Initialize selected IDs when modal opens
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setSelectedIds(lockedChapters.map((c) => c.id!).filter(Boolean));
      setPromoCode("");
    }
    onOpenChange(v);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === lockedChapters.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(lockedChapters.map((c) => c.id!).filter(Boolean));
    }
  };

  const toggleChapter = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Calculate base cost
  const baseCost = useMemo(() => {
    return lockedChapters
      .filter((c) => selectedIds.includes(c.id!))
      .reduce((acc, c) => acc + (c.coinCost || 20), 0);
  }, [lockedChapters, selectedIds]);

  const handleBulkUnlock = async () => {
    if (!session) {
      setLoginOpen(true);
      return;
    }

    if (selectedIds.length === 0) {
      toast.error("Please select at least one chapter to unlock");
      return;
    }

    try {
      const res = await buyBulkMutate({
        chapterIds: selectedIds,
        promoCode: promoCode.trim() || undefined,
      }).unwrap();

      if (res.success) {
        toast.success(`🎉 Unlocked ${res.data.unlockedCount} chapters successfully!`);
        refetchBalance();
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to unlock chapters");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="p-0 max-w-xl w-full rounded-3xl overflow-hidden border-white/10 bg-popover">
          <div className="p-6 sm:p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2.5 text-white">
                <Unlock className="w-6 h-6 text-primary" /> Bulk Unlock Chapters
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Unlock multiple chapters of <span className="text-white font-semibold">{seriesTitle}</span> at once. Apply creator promo codes to get extra discounts.
              </p>
            </DialogHeader>

            {/* Selection Toolbar */}
            <div className="flex items-center justify-between text-xs glass px-4 py-3 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  {selectedIds.length === lockedChapters.length ? "Deselect All" : "Select All Locked"}
                </button>
                <span className="text-muted-foreground">({selectedIds.length} of {lockedChapters.length} selected)</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Coins className="w-4 h-4" />
                <span>{baseCost} Points</span>
              </div>
            </div>

            {/* Chapters Checkbox List */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {lockedChapters.map((ch) => {
                const isSelected = selectedIds.includes(ch.id!);
                return (
                  <div
                    key={ch.id || ch.number}
                    onClick={() => ch.id && toggleChapter(ch.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? "bg-primary/10 border-primary/40 text-white font-medium"
                        : "bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          isSelected ? "bg-primary border-primary text-white" : "border-white/20"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="font-bold">Chapter #{ch.number}</span>
                      <span className="text-muted-foreground truncate max-w-[200px]">{ch.title}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-amber-400">
                      <Lock className="w-3 h-3" />
                      <span>{ch.coinCost || 20} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Promo Code Input Box */}
            <div className="glass p-4 rounded-2xl border border-white/5 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5 text-primary" /> Have a Creator Promo Code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="ENTER PROMO CODE"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white font-mono font-bold uppercase text-xs tracking-wider"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                * 1-Time use per account. Limited-time discounts will be calculated automatically upon confirmation.
              </p>
            </div>

            {/* Balance & Action Footer */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Your Balance:</span>
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{userPoints} Points</span>
                  {userPoints < baseCost && (
                    <Link
                      href="/rewards"
                      className="ml-2 text-primary hover:underline font-bold text-[11px]"
                    >
                      + Earn Free Points
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 py-3 glass hover:bg-white/10 text-white rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkUnlock}
                  disabled={unlocking || selectedIds.length === 0}
                  className="flex-[2] py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
                >
                  {unlocking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Unlock {selectedIds.length} Chapters ({baseCost} pts)
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
