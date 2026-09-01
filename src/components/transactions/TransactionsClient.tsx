"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { LoginDialog } from "@/components/home/LoginDialog";
import { Coins, LogIn, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { pointsService, PointTransactionItem } from "@/services/points.service";
import { siteService } from "@/services/site.service";
import { RequestWithdrawalAction } from "@/actions/withdrawal";

import { BalanceOverviewCard } from "./BalanceOverviewCard";
import { TransactionFilters, TransactionFilterType } from "./TransactionFilters";
import { TransactionList } from "./TransactionList";
import { CashoutModal } from "./CashoutModal";

type Transaction = PointTransactionItem;

export function TransactionsClient() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [loginOpen, setLoginOpen] = useState(false);

  const userRole = ((session?.user as any)?.role || "user").toLowerCase();
  const isCreator = userRole === "creator";

  const [balance, setBalance] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isCashOutDisabled, setIsCashOutDisabled] = useState(false);
  const [allowCreatorApplications, setAllowCreatorApplications] = useState(true);
  const [pointRate, setPointRate] = useState(0.01);
  const [minPoints, setMinPoints] = useState(1000);
  const [payoutMethods, setPayoutMethods] = useState<string[]>([
    "bKash",
    "Nagad",
    "Rocket",
    "Bank Transfer",
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Modal State
  const [filter, setFilter] = useState<TransactionFilterType>("ALL");
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
        pointsService.getTransactions(),
        siteService.getSiteConfig(),
      ]);

      if (txRes.success && txRes.data) {
        const d = txRes.data;
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

      if (configRes?.success && configRes?.data) {
        const c = configRes.data;
        if (c.enableCashOut !== undefined) setIsCashOutDisabled(!c.enableCashOut);
        if (c.allowCreatorApplications !== undefined)
          setAllowCreatorApplications(c.allowCreatorApplications);
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
  const isMobileWallet = ![
    "Bank Transfer",
    "PayPal",
    "Binance Pay / USDT",
    "USDT / Crypto",
  ].includes(payoutMethod);

  const hasValidDestination = isMobileWallet
    ? phoneNumber.trim().length >= 8
    : payoutMethod === "Bank Transfer"
    ? bankDetails.trim().length >= 5
    : phoneNumber.trim().length > 0 || bankDetails.trim().length > 0;

  const canSubmit =
    isCreator && numPoints >= minPoints && numPoints <= balance && hasValidDestination;

  const handleQuickPercent = (pct: number) => {
    const calculated = Math.floor(balance * pct);
    setPointsAmount(calculated.toString());
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCreator) {
      toast.error("Only creators can withdraw money.");
      return;
    }
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
        fullDetails = `[${payoutMethod} - ${accountType}] Phone: ${phoneNumber.trim()}${
          accountHolderName.trim() ? ` | Name: ${accountHolderName.trim()}` : ""
        }`;
      } else if (payoutMethod === "Bank Transfer") {
        fullDetails = `[Bank Transfer] ${bankDetails.trim()}${
          accountHolderName.trim() ? ` | Name: ${accountHolderName.trim()}` : ""
        }`;
      } else {
        fullDetails = `[${payoutMethod}] ${
          phoneNumber.trim() || bankDetails.trim()
        }${accountHolderName.trim() ? ` | Name: ${accountHolderName.trim()}` : ""}`;
      }

      const res = await RequestWithdrawalAction({
        pointsRequested: numPoints,
        bankDetails: fullDetails,
      });

      if (res.success) {
        toast.success("Cashout request submitted successfully! Pending admin approval.");
        setBalance((prev) => Math.max(0, prev - numPoints));
        const newTx: Transaction = {
          id: `temp-${Date.now()}`,
          type: "WITHDRAWAL",
          amount: -numPoints,
          description: `Requested cashout of ${numPoints.toLocaleString()} points ($${estimatedFiat} via ${payoutMethod} ${
            phoneNumber.trim() ? `to ${phoneNumber.trim()}` : ""
          })`,
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
    <div className="relative w-full">
      <div className="max-w-[72rem] w-full mx-auto px-4 pt-6 sm:pt-12 pb-24 sm:pb-12 relative z-10 space-y-6 sm:space-y-8">
        {/* Unauthenticated View */}
        {!sessionLoading && !session ? (
          <div className="glass rounded-3xl p-8 sm:p-12 border border-white/10 text-center max-w-xl mx-auto space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center mx-auto shadow-xl">
              <Coins className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Sign In to View Transactions
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Log in to check your points balance, transaction logs, ad reward history, and
                request cashout payouts via bKash, Nagad, and more.
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
                    Your account transactions and withdrawals have been temporarily frozen by
                    moderation. Cashout operations are disabled. Please contact support if you
                    believe this is an error.
                  </p>
                </div>
              </div>
            ) : isCashOutDisabled ? (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-amber-400 shadow-lg shadow-amber-500/5 animate-in fade-in">
                <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base">Cashout / Manual Payouts Turned Off</h3>
                  <p className="text-xs text-amber-400/80 mt-0.5">
                    Manual cashout and payouts are currently paused by administration. Please check
                    back later.
                  </p>
                </div>
              </div>
            ) : !isCreator ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-white/[0.02] to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-emerald-500/5 animate-in fade-in">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      Creator Cashout Only
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Creator Feature
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Only verified creators can withdraw points for fiat currency. Readers can use
                      points to read locked premium chapters and claim rewards.
                    </p>
                  </div>
                </div>
                {allowCreatorApplications && userRole === "user" && (
                  <Link
                    href="/dashboard/channel"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition shrink-0 whitespace-nowrap shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Become a Creator
                  </Link>
                )}
              </div>
            ) : null}

            {/* Header & Balance Banner */}
            <BalanceOverviewCard
              balance={balance}
              pointRate={pointRate}
              isFrozen={isFrozen}
              isCashOutDisabled={isCashOutDisabled}
              isCreator={isCreator}
              allowCreatorApplications={allowCreatorApplications}
              userRole={userRole}
              onOpenCashoutModal={() => {
                if (payoutMethods.length > 0 && !payoutMethods.includes(payoutMethod)) {
                  setPayoutMethod(payoutMethods[0]);
                }
                setIsModalOpen(true);
              }}
            />

            {/* Filter Tabs */}
            <TransactionFilters
              filter={filter}
              totalCount={transactions.length}
              onFilterChange={setFilter}
            />

            {/* Transactions Table */}
            <TransactionList transactions={filteredTransactions} loading={loading} />
          </>
        )}
      </div>

      {/* Login Dialog */}
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onAuthSuccess={fetchTransactionsData}
      />

      {/* Cashout / Withdrawal Modal */}
      <CashoutModal
        open={isModalOpen}
        isCreator={isCreator}
        allowCreatorApplications={allowCreatorApplications}
        userRole={userRole}
        minPoints={minPoints}
        pointRate={pointRate}
        balance={balance}
        pointsAmount={pointsAmount}
        payoutMethod={payoutMethod}
        payoutMethods={payoutMethods}
        phoneNumber={phoneNumber}
        accountType={accountType}
        accountHolderName={accountHolderName}
        bankDetails={bankDetails}
        submitting={submitting}
        canSubmit={canSubmit}
        onClose={() => setIsModalOpen(false)}
        onPointsAmountChange={setPointsAmount}
        onPayoutMethodChange={setPayoutMethod}
        onPhoneNumberChange={setPhoneNumber}
        onAccountTypeChange={setAccountType}
        onAccountHolderNameChange={setAccountHolderName}
        onBankDetailsChange={setBankDetails}
        onQuickPercent={handleQuickPercent}
        onSubmit={handleWithdrawalSubmit}
      />
    </div>
  );
}
