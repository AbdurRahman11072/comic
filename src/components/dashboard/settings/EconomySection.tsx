"use client";

import React from "react";
import { DollarSign, Plus, X } from "lucide-react";

interface EconomySectionProps {
  form: any;
  updateField: (key: string, value: any) => void;
}

export function EconomySection({ form, updateField }: EconomySectionProps) {
  const quickPresets = [
    "bKash",
    "Nagad",
    "Rocket",
    "Upay",
    "Bank Transfer",
    "PayPal",
    "Binance Pay / USDT",
  ];

  return (
    <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-emerald-400" /> Platform Economy & Creator Payout Rules
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Point to Fiat Conversion Rate ($ per point)
          </label>
          <input
            type="number"
            step="0.001"
            value={form.pointToFiatRate}
            onChange={(e) => updateField("pointToFiatRate", parseFloat(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
          />
          <p className="text-[11px] text-muted-foreground mt-1">Default 0.01 ($1 = 100 points)</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Minimum Withdrawal Points Threshold
          </label>
          <input
            type="number"
            value={form.minWithdrawalPoints}
            onChange={(e) => updateField("minWithdrawalPoints", parseInt(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
          />
          <p className="text-[11px] text-muted-foreground mt-1">Creators must accumulate at least this many points to withdraw</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Creator Revenue Share (%)
          </label>
          <input
            type="number"
            value={form.creatorRevenueSharePercent}
            onChange={(e) => updateField("creatorRevenueSharePercent", parseInt(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Max Daily Ad Points per Reader
          </label>
          <input
            type="number"
            value={form.maxDailyAdPoints}
            onChange={(e) => updateField("maxDailyAdPoints", parseInt(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Referral Ad Bonus (% of referee ad earnings)
          </label>
          <input
            type="number"
            value={form.referralBonusPercent}
            onChange={(e) => updateField("referralBonusPercent", parseInt(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Instant Referral Welcome Bonus (Points)
          </label>
          <input
            type="number"
            value={form.referralSignupBonus}
            onChange={(e) => updateField("referralSignupBonus", parseInt(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Featured Series Request Fee (Points)
          </label>
          <input
            type="number"
            value={form.featuredRequestFee}
            onChange={(e) => updateField("featuredRequestFee", parseInt(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
          />
        </div>
      </div>

      {/* Supported Cashout Platforms */}
      <div className="pt-6 border-t border-white/10 space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Supported Cashout & Payout Platforms (bKash, Nagad, Rocket, etc.)
          </label>
          <p className="text-xs text-muted-foreground">
            Users and creators can select from these configured platforms when requesting a point cashout.
          </p>
        </div>

        {/* Active Platform Chips */}
        <div className="flex flex-wrap gap-2 items-center">
          {(form.payoutMethods || []).map((method: string, index: number) => (
            <span
              key={`${method}-${index}`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-white font-semibold text-xs shadow-sm"
            >
              <span>{method}</span>
              <button
                type="button"
                onClick={() => {
                  const updated = (form.payoutMethods || []).filter((_: any, i: number) => i !== index);
                  updateField("payoutMethods", updated);
                }}
                className="text-white/60 hover:text-rose-400 p-0.5 rounded transition cursor-pointer"
                title="Remove method"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        {/* Add Custom Method Input & Quick Suggestions */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              id="new-payout-method-input"
              placeholder="Enter platform (e.g. bKash, Nagad, Rocket, Upay)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground text-xs outline-none focus:border-primary/50 transition"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = (e.currentTarget.value || "").trim();
                  if (val && !(form.payoutMethods || []).includes(val)) {
                    updateField("payoutMethods", [...(form.payoutMethods || []), val]);
                    e.currentTarget.value = "";
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById("new-payout-method-input") as HTMLInputElement;
                if (input) {
                  const val = input.value.trim();
                  if (val && !(form.payoutMethods || []).includes(val)) {
                    updateField("payoutMethods", [...(form.payoutMethods || []), val]);
                    input.value = "";
                  }
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground mr-1">Quick presets:</span>
            {quickPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  if (!(form.payoutMethods || []).includes(preset)) {
                    updateField("payoutMethods", [...(form.payoutMethods || []), preset]);
                  }
                }}
                disabled={form.payoutMethods?.includes(preset)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-muted-foreground hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
