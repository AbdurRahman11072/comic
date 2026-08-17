"use client";

import { useState } from "react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import {
  Wallet, ArrowUpRight, CheckCircle2, Clock, XCircle,
  Loader2, AlertCircle, Phone, ArrowDownLeft, Shield, Sparkles,
  Info, DollarSign
} from "lucide-react";
import {
  useGetPointsBalanceQuery,
  useGetTransactionsQuery,
  useGetMyWithdrawalsQuery,
  useRequestCashOutMutation,
} from "@/redux/api/pointsApi";
import { useGetSiteConfigQuery } from "@/redux/api/siteConfigApi";
import { toast } from "react-hot-toast";

interface TransactionsClientProps {
  initialData?: {
    balance: number;
    transactions: any[];
  };
}

const PAYMENT_METHODS = [
  { id: "bKash", name: "bKash", color: "pink", sub: "Personal/Merchant Wallet", bg: "bg-pink-600/10 border-pink-500/30 text-pink-400" },
  { id: "Nagad", name: "Nagad", color: "orange", sub: "Personal Wallet", bg: "bg-orange-600/10 border-orange-500/30 text-orange-400" },
  { id: "Rocket", name: "Rocket", color: "purple", sub: "DBBL Rocket Wallet", bg: "bg-purple-600/10 border-purple-500/30 text-purple-400" },
  { id: "Bank Transfer", name: "Bank Transfer", color: "blue", sub: "Direct Bank Account", bg: "bg-blue-600/10 border-blue-500/30 text-blue-400" },
];

export function TransactionsClient({ initialData }: TransactionsClientProps) {
  const { data: balanceData } = useGetPointsBalanceQuery();
  const { data: transactionsData, isLoading: txLoading } = useGetTransactionsQuery();
  const { data: withdrawalsData, isLoading: wLoading } = useGetMyWithdrawalsQuery();
  const { data: configRes } = useGetSiteConfigQuery();
  const [requestCashOut, { isLoading: submitting }] = useRequestCashOutMutation();

  const [activeTab, setActiveTab] = useState<"transactions" | "withdrawals">("transactions");
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);

  // Form State
  const [pointsInput, setPointsInput] = useState<number | string>("");
  const [selectedMethod, setSelectedMethod] = useState("bKash");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("Personal");
  const [notes, setNotes] = useState("");

  const currentBalance = balanceData?.data?.points ?? initialData?.balance ?? 0;
  const config = configRes?.data;
  const isCashOutEnabled = config?.enableCashOut ?? true;
  const minPoints = config?.minWithdrawalPoints ?? 1000;
  const rate = config?.pointToFiatRate ?? 0.01;

  const pointsNum = typeof pointsInput === "number" ? pointsInput : parseInt(pointsInput || "0", 10);
  const estimatedFiat = (pointsNum * rate).toFixed(2);
  const estimatedBDT = Math.round(pointsNum * rate * 120); // Estimated BDT conversion

  const handleOpenCashout = () => {
    if (!isCashOutEnabled) {
      toast.error("CashOut requests are currently paused by administration.");
      return;
    }
    setPointsInput(minPoints);
    setIsCashOutOpen(true);
  };

  const handleSubmitCashout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCashOutEnabled) {
      toast.error("CashOut requests are currently paused.");
      return;
    }

    if (!pointsNum || pointsNum <= 0) {
      toast.error("Please enter a valid points amount.");
      return;
    }

    if (pointsNum < minPoints) {
      toast.error(`Minimum cashout is ${minPoints.toLocaleString()} points.`);
      return;
    }

    if (pointsNum > currentBalance) {
      toast.error("Insufficient points balance.");
      return;
    }

    if (!accountNumber.trim()) {
      toast.error("Please enter your account / phone number.");
      return;
    }

    try {
      const formattedAccount = `${accountNumber.trim()} (${accountType})`;
      await requestCashOut({
        pointsRequested: pointsNum,
        paymentMethod: selectedMethod,
        accountNumber: formattedAccount,
        notes: notes.trim() || undefined,
      }).unwrap();

      toast.success("CashOut request submitted! Admin/moderator will process your payment.");
      setIsCashOutOpen(false);
      setPointsInput("");
      setAccountNumber("");
      setNotes("");
      setActiveTab("withdrawals");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to submit cashout request.");
    }
  };

  const transactionsList = transactionsData?.data?.transactions ?? initialData?.transactions ?? [];
  const withdrawalsList = withdrawalsData?.data ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-[72rem] w-full mx-auto px-4 py-12 relative z-10 space-y-8">
        {/* Top Header & Balance Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-heading tracking-tight mb-2 text-white">
              Points & Transactions
            </h1>
            <p className="text-muted-foreground text-sm">
              Keep track of your points, ad earnings, chapter unlocks, and cashout requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Balance Card */}
            <div className="glass p-5 px-6 rounded-3xl border border-coin/30 flex items-center gap-4 shadow-xl shadow-coin/5">
              <div className="w-12 h-12 rounded-2xl bg-coin/10 border border-coin/20 flex items-center justify-center text-coin">
                <svg viewBox="0 0 20 20" width="24" height="24" fill="currentColor">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <text x="10" y="14.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">P</text>
                </svg>
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground block">
                  Available Balance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-coin">
                    {currentBalance.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono font-medium">
                    (≈ ${(currentBalance * rate).toFixed(2)})
                  </span>
                </div>
              </div>
            </div>

            {/* CashOut Action Button */}
            <button
              onClick={handleOpenCashout}
              className={`flex items-center gap-2.5 px-6 py-4 rounded-3xl font-bold text-sm transition-all shadow-xl ${
                isCashOutEnabled
                  ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20 hover:scale-[1.02]"
                  : "glass text-muted-foreground cursor-not-allowed border-white/5 opacity-60"
              }`}
            >
              <Wallet className="w-5 h-5 text-coin" />
              <span>{isCashOutEnabled ? "Request CashOut" : "CashOut Paused"}</span>
              <ArrowUpRight className="w-4 h-4 opacity-70" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === "transactions"
                ? "bg-white/10 text-white border border-white/10"
                : "glass glass-hover text-muted-foreground hover:text-white"
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            Transaction History ({transactionsList.length})
          </button>

          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === "withdrawals"
                ? "bg-white/10 text-white border border-white/10"
                : "glass glass-hover text-muted-foreground hover:text-white"
            }`}
          >
            <Wallet className="w-4 h-4 text-coin" />
            CashOut Requests ({withdrawalsList.length})
          </button>
        </div>

        {/* TAB 1: ALL TRANSACTIONS */}
        {activeTab === "transactions" && (
          <div className="glass rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {transactionsList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground">
                        No transactions found yet. Start reading series and earning rewards!
                      </td>
                    </tr>
                  ) : (
                    transactionsList.map((t: any) => {
                      const isPositive = t.amount > 0;
                      const isAd = t.type === "EARN_AD";
                      const isWithdraw = t.type === "WITHDRAWAL";
                      const isChapter = t.type === "BUY_CHAPTER";

                      return (
                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isAd
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                  : isWithdraw
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : isChapter
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}
                            >
                              {t.type.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-white/90">{t.description}</td>
                          <td className="px-6 py-4 text-muted-foreground text-xs">
                            {new Date(t.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td
                            className={`px-6 py-4 text-right font-bold text-sm font-mono ${
                              isPositive ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {t.amount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CASHOUT REQUESTS */}
        {activeTab === "withdrawals" && (
          <div className="space-y-4">
            {withdrawalsList.length === 0 ? (
              <div className="glass rounded-[2rem] p-12 text-center text-muted-foreground border border-white/5">
                <Wallet className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-base font-bold text-white mb-1">No CashOut Requests Yet</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
                  When you request a payout, your request and payment status will appear here.
                </p>
                <button
                  onClick={handleOpenCashout}
                  className="px-6 py-2.5 bg-primary text-white rounded-2xl font-bold text-xs hover:bg-primary/90 transition shadow-lg shadow-primary/20"
                >
                  Request First CashOut
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {withdrawalsList.map((w: any) => {
                  const method = w.paymentMethod || "bKash";
                  const isBkash = method.toLowerCase().includes("bkash");
                  const isNagad = method.toLowerCase().includes("nagad");
                  const isRocket = method.toLowerCase().includes("rocket");

                  return (
                    <div
                      key={w.id}
                      className="glass rounded-3xl p-6 border border-white/10 space-y-4 hover:border-white/20 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-black uppercase ${
                              isBkash
                                ? "bg-pink-600/20 text-pink-400 border border-pink-500/30"
                                : isNagad
                                ? "bg-orange-600/20 text-orange-400 border border-orange-500/30"
                                : isRocket
                                ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                                : "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {method}
                          </span>

                          <span
                            className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                              w.status === "PENDING"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : w.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {w.status === "PENDING" && <Clock className="w-3.5 h-3.5" />}
                            {w.status === "APPROVED" && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {w.status === "REJECTED" && <XCircle className="w-3.5 h-3.5" />}
                            {w.status}
                          </span>
                        </div>

                        <span className="text-xs text-muted-foreground">
                          {new Date(w.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Points</p>
                          <p className="text-lg font-black text-coin">{w.pointsRequested.toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Payout Amount</p>
                          <p className="text-lg font-black text-emerald-400">${w.fiatAmount.toFixed(2)}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 col-span-2 sm:col-span-1">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Account Destination</p>
                          <p className="text-sm font-mono font-bold text-white truncate">
                            {w.accountNumber || w.bankDetails}
                          </p>
                        </div>
                      </div>

                      {w.notes && (
                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-muted-foreground flex items-start gap-2">
                          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>Admin/Mod Note: {w.notes}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* CASHOUT MODAL */}
      {isCashOutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass w-full max-w-lg p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Wallet className="w-6 h-6 text-coin" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Request CashOut</h3>
                  <p className="text-xs text-muted-foreground">
                    Convert points to cash & receive money directly to your mobile wallet.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCashOutOpen(false)}
                className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCashout} className="space-y-5">
              {/* Point Amount Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold uppercase tracking-wider text-muted-foreground">
                    Points to Withdraw
                  </label>
                  <span className="text-muted-foreground">
                    Min: <strong className="text-white">{minPoints.toLocaleString()}</strong> | Balance:{" "}
                    <strong className="text-coin">{currentBalance.toLocaleString()}</strong>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={minPoints}
                    max={currentBalance}
                    value={pointsInput}
                    onChange={(e) => setPointsInput(e.target.value)}
                    placeholder={`e.g. ${minPoints}`}
                    required
                    className="w-full px-5 py-3.5 pr-20 rounded-2xl bg-white/5 border border-white/10 text-white font-mono text-lg font-bold outline-none focus:border-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => setPointsInput(currentBalance)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-coin transition"
                  >
                    MAX
                  </button>
                </div>

                {/* Live Conversion Banner */}
                {pointsNum > 0 && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <DollarSign className="w-4 h-4" />
                      <span>Estimated Payout:</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-300 font-mono">${estimatedFiat} USD</span>
                      <span className="text-muted-foreground ml-1.5">(≈ {estimatedBDT.toLocaleString()} BDT)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Select Payout Method
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PAYMENT_METHODS.map((m) => {
                    const isSelected = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? `${m.bg} shadow-lg ring-2 ring-primary/40`
                            : "glass hover:bg-white/5 border-white/5 text-muted-foreground"
                        }`}
                      >
                        <span className="font-bold text-sm text-white">{m.name}</span>
                        <span className="text-[10px] opacity-70 mt-0.5">{m.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Account Number / Phone */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  {selectedMethod} Account / Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={selectedMethod === "Bank Transfer" ? "Bank Name, AC No, Routing..." : "e.g. 017XXXXXXXX"}
                    required
                    className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-mono text-sm outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Account Type (Personal / Agent) */}
              {selectedMethod !== "Bank Transfer" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Account Type
                  </label>
                  <div className="flex gap-2">
                    {["Personal", "Agent", "Merchant"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAccountType(type)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                          accountType === type
                            ? "bg-primary text-white"
                            : "glass text-muted-foreground hover:text-white"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Remarks */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Contact me on WhatsApp if needed"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Notice */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-muted-foreground flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-coin shrink-0 mt-0.5" />
                <span>
                  Points will be deducted immediately. Payments are sent manually within 24–48 hours. If rejected, points are automatically refunded.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCashOutOpen(false)}
                  className="px-5 py-3 rounded-2xl glass text-xs font-bold text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || pointsNum > currentBalance || pointsNum < minPoints}
                  className="flex-1 px-6 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      <span>Submit CashOut</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
