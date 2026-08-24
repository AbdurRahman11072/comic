"use client";

import React from "react";
import Link from "next/link";
import {
  Building,
  CheckCircle2,
  Loader2,
  Lock,
  Phone,
  Smartphone,
  Sparkles,
  User,
  Wallet,
  X,
} from "lucide-react";

interface CashoutModalProps {
  open: boolean;
  isCreator: boolean;
  allowCreatorApplications: boolean;
  userRole: string;
  minPoints: number;
  pointRate: number;
  balance: number;
  pointsAmount: string;
  payoutMethod: string;
  payoutMethods: string[];
  phoneNumber: string;
  accountType: "Personal" | "Agent" | "Merchant";
  accountHolderName: string;
  bankDetails: string;
  submitting: boolean;
  canSubmit: boolean;
  onClose: () => void;
  onPointsAmountChange: (val: string) => void;
  onPayoutMethodChange: (val: string) => void;
  onPhoneNumberChange: (val: string) => void;
  onAccountTypeChange: (val: "Personal" | "Agent" | "Merchant") => void;
  onAccountHolderNameChange: (val: string) => void;
  onBankDetailsChange: (val: string) => void;
  onQuickPercent: (pct: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CashoutModal({
  open,
  isCreator,
  allowCreatorApplications,
  userRole,
  minPoints,
  pointRate,
  balance,
  pointsAmount,
  payoutMethod,
  payoutMethods,
  phoneNumber,
  accountType,
  accountHolderName,
  bankDetails,
  submitting,
  canSubmit,
  onClose,
  onPointsAmountChange,
  onPayoutMethodChange,
  onPhoneNumberChange,
  onAccountTypeChange,
  onAccountHolderNameChange,
  onBankDetailsChange,
  onQuickPercent,
  onSubmit,
}: CashoutModalProps) {
  if (!open) return null;

  const numPoints = Number(pointsAmount) || 0;
  const estimatedFiat = (numPoints * pointRate).toFixed(2);
  const isMobileWallet = !["Bank Transfer", "PayPal", "Binance Pay / USDT", "USDT / Crypto"].includes(
    payoutMethod
  );

  return (
    <div
      id="cashout-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="cashout-modal-dialog"
        className="w-full max-w-lg glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Wallet className="w-3.5 h-3.5" /> Payout Request
          </div>
          <h2 className="text-2xl font-extrabold text-white">Cashout Points to Cash</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Convert your earned points to real currency. Minimum withdrawal is{" "}
            <span className="text-white font-bold">{minPoints.toLocaleString()} points</span> ($
            {(minPoints * pointRate).toFixed(2)} USD).
          </p>
        </div>

        {!isCreator ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Creator Access Only</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Points cashouts and manual withdrawals are exclusively available to verified Creators. Readers can spend points on chapters and reward features.
              </p>
            </div>
            {allowCreatorApplications && userRole === "user" && (
              <Link
                href="/dashboard/channel"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Become a Creator
              </Link>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Balance Summary Pill */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground block">Available Balance</span>
                <span className="text-lg font-bold text-coin">{balance.toLocaleString()} pts</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-muted-foreground block">Conversion Rate</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">1 pt = ${pointRate} USD</span>
              </div>
            </div>

            {/* Points Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Points to Withdraw <span className="text-primary">*</span>
                </label>
                {numPoints > 0 && (
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ≈ ${estimatedFiat} USD
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={minPoints}
                  max={balance}
                  required
                  placeholder={`Min. ${minPoints}`}
                  value={pointsAmount}
                  onChange={(e) => onPointsAmountChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-mono text-base outline-none focus:border-primary transition"
                />
                <span className="absolute right-4 top-3.5 text-xs text-muted-foreground font-bold">PTS</span>
              </div>

              {/* Quick Percentage Chips */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => onPointsAmountChange(minPoints.toString())}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-muted-foreground hover:text-white transition cursor-pointer"
                >
                  Min ({minPoints})
                </button>
                <button
                  type="button"
                  onClick={() => onQuickPercent(0.25)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-muted-foreground hover:text-white transition cursor-pointer"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => onQuickPercent(0.5)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-muted-foreground hover:text-white transition cursor-pointer"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => onQuickPercent(1.0)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-primary hover:text-primary-foreground hover:bg-primary transition cursor-pointer"
                >
                  Max ({balance.toLocaleString()})
                </button>
              </div>
            </div>

            {/* Dynamic Platform Selection from Admin SiteConfig */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Transaction Platform <span className="text-primary">*</span></span>
                <span className="text-[10px] text-muted-foreground font-normal">Configured by Admin</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {payoutMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => onPayoutMethodChange(method)}
                    className={`p-3 rounded-2xl border text-xs font-bold text-center transition flex items-center justify-center gap-2 cursor-pointer ${
                      payoutMethod === method
                        ? "border-primary bg-primary/15 text-primary shadow-md shadow-primary/10"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span>{method}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Phone Number or Account Input */}
            {isMobileWallet ? (
              <div className="space-y-3">
                {/* Phone Number Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    {payoutMethod} Phone Number <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => onPhoneNumberChange(e.target.value)}
                      placeholder="e.g. 017XXXXXXXX or +880 1XXXXXXXXX"
                      className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                {/* Account Type Selector (Personal / Agent / Merchant) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Account Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Personal", "Agent", "Merchant"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => onAccountTypeChange(type)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          accountType === type
                            ? "bg-white/10 border-primary text-white"
                            : "bg-white/[0.02] border-white/10 text-muted-foreground hover:text-white"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account Holder Name (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    Account Holder Name / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => onAccountHolderNameChange(e.target.value)}
                    placeholder="e.g. John Doe (Optional)"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-xs outline-none focus:border-primary transition"
                  />
                </div>
              </div>
            ) : payoutMethod === "Bank Transfer" ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-primary" />
                    Bank Account & Routing Details <span className="text-primary">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={bankDetails}
                    onChange={(e) => onBankDetailsChange(e.target.value)}
                    placeholder="Bank Name, Account Number, Branch / Routing / IBAN"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-xs outline-none focus:border-primary transition resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => onAccountHolderNameChange(e.target.value)}
                    placeholder="Full Name as on Bank Account"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-xs outline-none focus:border-primary transition"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    {payoutMethod} Account / Address <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => onPhoneNumberChange(e.target.value)}
                    placeholder={payoutMethod === "PayPal" ? "your-paypal@example.com" : "Wallet Address (TRC20 / BEP20)"}
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-primary transition"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="submit-cashout-btn"
              disabled={submitting || !canSubmit}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition shadow-xl shadow-primary/25 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Cashout Request...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Cashout Request for ${estimatedFiat} USD
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
