"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { useSession } from "@/lib/auth-client";
import { LoginDialog } from "@/components/home/LoginDialog";
import {
  ShieldAlert,
  ArrowRight,
  Lock,
  CreditCard,
  X,
  Loader2,
  CheckCircle2,
  DollarSign,
  Coins,
  History,
  TrendingDown,
  TrendingUp,
  Wallet,
  LogIn,
  Phone,
  Building,
  User,
  Sparkles,
  Smartphone
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export function TransactionsClient() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [loginOpen, setLoginOpen] = useState(false);

  const [balance, setBalance] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isCashOutDisabled, setIsCashOutDisabled] = useState(false);
  const [pointRate, setPointRate] = useState(0.01);
  const [minPoints, setMinPoints] = useState(1000);
  const [payoutMethods, setPayoutMethods] = useState<string[]>(["bKash", "Nagad", "Rocket", "Bank Transfer"]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Modal State
  const [filter, setFilter] = useState<"ALL" | "EARNED" | "SPENT" | "WITHDRAWALS">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Withdrawal Form State
  const [pointsAmount, setPointsAmount] = useState<string>("");
  const [payoutMethod, setPayoutMethod] = useState<string>("bKash");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [accountType, setAccountType] = useState<"Personal" | "Agent" | "Merchant">("Personal");
  const [accountHolderName, setAccountHolderName] = useState<string>("");
  const [bankDetails, setBankDetails] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactionsData = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [txRes, configRes] = await Promise.all([
        api.get("/api/v1/points/transactions"),
        api.get("/api/v1/site-config"),
      ]);

      if (txRes.data?.success && txRes.data?.data) {
        const d = txRes.data.data;
        setBalance(d.balance ?? 0);
        setIsFrozen(d.transactionsFrozen ?? false);
        if (d.enableCashOut !== undefined) setIsCashOutDisabled(!d.enableCashOut);
        if (d.pointToFiatRate) setPointRate(d.pointToFiatRate);
        if (d.minWithdrawalPoints) setMinPoints(d.minWithdrawalPoints);
        if (d.payoutMethods && Array.isArray(d.payoutMethods) && d.payoutMethods.length > 0) {
          setPayoutMethods(d.payoutMethods);
          setPayoutMethod(d.payoutMethods[0]);
        }
        setTransactions(d.transactions ?? []);
      }

      if (configRes.data?.success && configRes.data?.data) {
        const c = configRes.data.data;
        if (c.enableCashOut !== undefined) setIsCashOutDisabled(!c.enableCashOut);
        if (c.pointToFiatRate) setPointRate(c.pointToFiatRate);
        if (c.minWithdrawalPoints) setMinPoints(c.minWithdrawalPoints);
        if (c.payoutMethods && Array.isArray(c.payoutMethods) && c.payoutMethods.length > 0) {
          setPayoutMethods(c.payoutMethods);
          if (!payoutMethod || !c.payoutMethods.includes(payoutMethod)) {
            setPayoutMethod(c.payoutMethods[0]);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionLoading) {
      fetchTransactionsData();
    }
  }, [session, sessionLoading]);

  const numPoints = Number(pointsAmount) || 0;
  const estimatedFiat = (numPoints * pointRate).toFixed(2);
  
  const isMobileWallet = !["Bank Transfer", "PayPal", "Binance Pay / USDT", "USDT / Crypto"].includes(payoutMethod);
  
  const hasValidDestination = isMobileWallet
    ? phoneNumber.trim().length >= 8
    : payoutMethod === "Bank Transfer"
    ? bankDetails.trim().length >= 5
    : phoneNumber.trim().length > 0 || bankDetails.trim().length > 0;

  const canSubmit = numPoints >= minPoints && numPoints <= balance && hasValidDestination;

  const handleQuickPercent = (pct: number) => {
    const calculated = Math.floor(balance * pct);
    setPointsAmount(calculated.toString());
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      if (numPoints < minPoints) {
        toast.error(`Minimum withdrawal is ${minPoints.toLocaleString()} points.`);
      } else if (numPoints > balance) {
        toast.error("Insufficient points balance.");
      } else if (isMobileWallet && !phoneNumber.trim()) {
        toast.error(`Please enter your ${payoutMethod} mobile phone number.`);
      } else {
        toast.error("Please provide valid payout details.");
      }
      return;
    }

    setSubmitting(true);
    try {
      let fullDetails = "";
      if (isMobileWallet) {
        fullDetails = `[${payoutMethod} - ${accountType}] Phone: ${phoneNumber.trim()}${accountHolderName.trim() ? ` | Name: ${accountHolderName.trim()}` : ""}`;
      } else if (payoutMethod === "Bank Transfer") {
        fullDetails = `[Bank Transfer] ${bankDetails.trim()}${accountHolderName.trim() ? ` | Name: ${accountHolderName.trim()}` : ""}`;
      } else {
        fullDetails = `[${payoutMethod}] ${phoneNumber.trim() || bankDetails.trim()}${accountHolderName.trim() ? ` | Name: ${accountHolderName.trim()}` : ""}`;
      }

      const res = await api.post("/api/v1/withdrawals", {
        pointsRequested: numPoints,
        bankDetails: fullDetails,
      });

      if (res.data?.success || res.status === 201) {
        toast.success("Cashout request submitted successfully! Pending admin approval.");
        setBalance((prev) => Math.max(0, prev - numPoints));
        const newTx: Transaction = {
          id: `temp-${Date.now()}`,
          type: "WITHDRAWAL",
          amount: -numPoints,
          description: `Requested cashout of ${numPoints.toLocaleString()} points ($${estimatedFiat} via ${payoutMethod} ${phoneNumber.trim() ? `to ${phoneNumber.trim()}` : ""})`,
          createdAt: new Date().toISOString(),
        };
        setTransactions((prev) => [newTx, ...prev]);
        setIsModalOpen(false);
        setPointsAmount("");
        setPhoneNumber("");
        setAccountHolderName("");
        setBankDetails("");
      } else {
        toast.error(res.data?.message || "Failed to submit cashout request.");
      }
    } catch (err: any) {
      console.error("Withdrawal error:", err);
      toast.error(err.response?.data?.message || "Failed to submit cashout request.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "EARNED") return t.amount > 0;
    if (filter === "SPENT") return t.amount < 0 && t.type !== "WITHDRAWAL";
    if (filter === "WITHDRAWALS") return t.type === "WITHDRAWAL";
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-[72rem] w-full mx-auto px-4 py-12 relative z-10 space-y-8">
        {/* Unauthenticated View */}
        {!sessionLoading && !session ? (
          <div className="glass rounded-3xl p-8 sm:p-12 border border-white/10 text-center max-w-xl mx-auto space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center mx-auto shadow-xl">
              <Coins className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Sign In to View Transactions</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Log in to check your points balance, transaction logs, ad reward history, and request cashout payouts via bKash, Nagad, and more.
              </p>
            </div>
            <button
              onClick={() => setLoginOpen(true)}
              className="px-8 py-3.5 rounded-2xl bg-primary text-white text-sm font-bold shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Sign In Now
            </button>
          </div>
        ) : (
          <>
            {/* Account Frozen Alert Banner */}
            {isFrozen ? (
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3.5 text-rose-400 shadow-lg shadow-rose-500/5 animate-in fade-in">
                <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base">Account Has Been Frozen</h3>
                  <p className="text-xs text-rose-400/80 mt-0.5">
                    Your account transactions and withdrawals have been temporarily frozen by moderation. Cashout operations are disabled. Please contact support if you believe this is an error.
                  </p>
                </div>
              </div>
            ) : isCashOutDisabled ? (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-amber-400 shadow-lg shadow-amber-500/5 animate-in fade-in">
                <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base">Cashout / Manual Payouts Turned Off</h3>
                  <p className="text-xs text-amber-400/80 mt-0.5">
                    Manual cashout and payouts are currently paused by administration. Please check back later.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Header & Balance Banner */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Wallet & Payouts
                </div>
                <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-white">
                  Transaction History
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Keep track of your earnings, rewards, unlock history, and cashout requests.
                </p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {/* Current Balance Card */}
                <div className="glass p-5 rounded-3xl border border-coin/20 flex flex-col items-center justify-center min-w-[200px] shadow-xl">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-coin/70 mb-1 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-coin" /> Current Balance
                  </span>
                  <div className="flex items-center gap-2 text-2xl font-extrabold text-coin">
                    <span>{balance.toLocaleString()}</span>
                    <span className="text-xs font-normal text-muted-foreground">pts</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    ≈ ${(balance * pointRate).toFixed(2)} USD
                  </span>
                </div>

                {/* Cashout / Withdrawal Action Button */}
                {isFrozen ? (
                  <button
                    disabled
                    className="px-6 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-75"
                    title="Your account has been frozen"
                  >
                    <Lock className="w-4 h-4" />
                    Cashout Disabled (Frozen)
                  </button>
                ) : isCashOutDisabled ? (
                  <button
                    disabled
                    className="px-6 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-75"
                    title="Cashout is currently turned off by administration"
                  >
                    <Lock className="w-4 h-4" />
                    Cashout Is Turned Off
                  </button>
                ) : (
                  <button
                    id="request-cashout-btn"
                    onClick={() => {
                      if (payoutMethods.length > 0 && !payoutMethods.includes(payoutMethod)) {
                        setPayoutMethod(payoutMethods[0]);
                      }
                      setIsModalOpen(true);
                    }}
                    className="px-6 py-4 rounded-2xl bg-primary text-white font-bold text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition shadow-xl shadow-primary/25 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    Request Cashout <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filter === "ALL" ? "bg-primary text-white" : "bg-white/5 text-muted-foreground hover:text-white"
                }`}
              >
                All Activity ({transactions.length})
              </button>
              <button
                onClick={() => setFilter("EARNED")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  filter === "EARNED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-muted-foreground hover:text-white"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Earned Points
              </button>
              <button
                onClick={() => setFilter("SPENT")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  filter === "SPENT" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-white/5 text-muted-foreground hover:text-white"
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" /> Point Spending
              </button>
              <button
                onClick={() => setFilter("WITHDRAWALS")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  filter === "WITHDRAWALS" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/5 text-muted-foreground hover:text-white"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" /> Withdrawals
              </button>
            </div>

            {/* Transactions Table */}
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
                  <tbody className="divide-y divide-white/5 text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                          Loading transactions...
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                          <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          No transactions found in this category.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const isPositive = tx.amount > 0;
                        return (
                          <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                                  tx.type === "WITHDRAWAL"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : isPositive
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-white/90 font-medium">{tx.description}</td>
                            <td className="px-6 py-4 text-muted-foreground text-xs">
                              {new Date(tx.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td
                              className={`px-6 py-4 text-right font-mono font-bold ${
                                isPositive ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {isPositive ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

      {/* Login Dialog for Unauthenticated Users */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} onAuthSuccess={fetchTransactionsData} />

      {/* CASHOUT / WITHDRAWAL MODAL */}
      {isModalOpen && (
        <div
          id="cashout-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            id="cashout-modal-dialog"
            className="w-full max-w-lg glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleWithdrawalSubmit} className="space-y-5">
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
                    onChange={(e) => setPointsAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-mono text-base outline-none focus:border-primary transition"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-muted-foreground font-bold">PTS</span>
                </div>

                {/* Quick Percentage Chips */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPointsAmount(minPoints.toString())}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-muted-foreground hover:text-white transition cursor-pointer"
                  >
                    Min ({minPoints})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(0.25)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-muted-foreground hover:text-white transition cursor-pointer"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(0.5)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-muted-foreground hover:text-white transition cursor-pointer"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(1.0)}
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
                      onClick={() => setPayoutMethod(method)}
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
                        onChange={(e) => setPhoneNumber(e.target.value)}
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
                          onClick={() => setAccountType(type)}
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
                      onChange={(e) => setAccountHolderName(e.target.value)}
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
                      onChange={(e) => setBankDetails(e.target.value)}
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
                      onChange={(e) => setAccountHolderName(e.target.value)}
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
                      onChange={(e) => setPhoneNumber(e.target.value)}
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
          </div>
        </div>
      )}
    </div>
  );
}
