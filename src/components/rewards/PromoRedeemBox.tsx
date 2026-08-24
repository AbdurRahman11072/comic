"use client";

import React, { useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { RedeemPromoCodeAction } from "@/actions/promo";

export function PromoRedeemBox() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      const res = await RedeemPromoCodeAction({ code: code.trim() });
      if (res.success) {
        const pts = res.data?.pointsAwarded ?? 0;
        toast.success(`🎉 Code redeemed! You got ${pts} points.`);
        setCode("");
      } else {
        toast.error(res.message || "Invalid or expired promo code.");
      }
    } catch (_err) {
      toast.error("Invalid or expired promo code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full glass p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex items-center gap-2">
        <Gift className="w-5 h-5 text-amber-400" />
        <h3 className="text-base font-bold text-white">Have a Promo Code?</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Redeem codes from creators or special events to get instant free coins.
      </p>
      <form onSubmit={handleRedeem} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ENTER PROMO CODE"
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-amber-400/50 outline-none text-white font-mono font-bold uppercase text-xs tracking-wider"
        />
        <button
          type="submit"
          disabled={isLoading || !code.trim()}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition disabled:opacity-50 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
        </button>
      </form>
    </div>
  );
}
