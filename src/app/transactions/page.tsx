import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { pointsService } from "@/services/points.service";
import { redirect } from "next/navigation";
import { ShieldAlert, ArrowRight, Lock, CreditCard } from "lucide-react";
import Link from "next/link";

export default async function TransactionsPage() {
  const data = await pointsService.getTransactions();

  if (!data || data.transactions === undefined) {
    redirect("/");
  }

  const isFrozen = data?.transactionsFrozen ?? false;
  const isCashOutDisabled = data?.enableCashOut === false;

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-[72rem] w-full mx-auto px-4 py-12 relative z-10">
        {/* Account Frozen Alert Banner */}
        {isFrozen ? (
          <div className="mb-8 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3.5 text-rose-400 shadow-lg shadow-rose-500/5">
            <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base">Account Has Been Frozen</h3>
              <p className="text-xs text-rose-400/80 mt-0.5">
                Your account transactions and withdrawals have been temporarily frozen by moderation. Cashout operations are disabled. Please contact support if you believe this is an error.
              </p>
            </div>
          </div>
        ) : isCashOutDisabled ? (
          <div className="mb-8 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-amber-400 shadow-lg shadow-amber-500/5">
            <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base">Cashout / Manual Payouts Turned Off</h3>
              <p className="text-xs text-amber-400/80 mt-0.5">
                Manual cashout and payouts are currently paused by administration. Cashout operations are temporarily disabled. Please check back later.
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-heading tracking-tight mb-2">Transaction History</h1>
            <p className="text-muted-foreground">Keep track of your earnings, rewards, and point spending.</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="glass p-5 rounded-3xl border-coin/20 flex flex-col items-center justify-center min-w-[180px]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-coin/60 mb-1">Current Balance</span>
              <div className="flex items-center gap-2 text-2xl font-bold text-coin">
                <svg viewBox="0 0 20 20" width="22" height="22" fill="currentColor">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <text x="10" y="14.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">P</text>
                </svg>
                {data?.balance.toLocaleString() ?? 0}
              </div>
            </div>

            {/* Cashout / Withdrawal Action Button */}
            {isFrozen ? (
              <button
                disabled
                className="px-5 py-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-75"
                title="Your account has been frozen"
              >
                <Lock className="w-4 h-4" />
                Cashout Disabled (Account Frozen)
              </button>
            ) : isCashOutDisabled ? (
              <button
                disabled
                className="px-5 py-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-75"
                title="Cashout is currently turned off by administration"
              >
                <Lock className="w-4 h-4" />
                Cashout Is Turned Off
              </button>
            ) : (
              <Link
                href="/dashboard/earnings"
                className="px-5 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-primary/20"
              >
                <CreditCard className="w-4 h-4" />
                Request Cashout <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        <div className="glass rounded-[2rem] overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {data?.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No transactions found yet. Start earning points in the Rewards page!
                    </td>
                  </tr>
                ) : (
                  data?.transactions.map((t: any) => (
                    <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5">
                        <span 
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            t.type === 'EARN_AD' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {t.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-medium">{t.description}</td>
                      <td className="px-6 py-5 text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className={`px-6 py-5 text-right font-bold text-base ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
