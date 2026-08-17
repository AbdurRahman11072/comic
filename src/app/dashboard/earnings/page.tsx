"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { DollarSign, Gift, TrendingUp, Users, ArrowRight, Loader2, AlertCircle, Copy } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface UserProfile {
  id: string;
  points: number;
  dailyAdViews: number;
  dailyAdPointsEarned: number;
  referralCode: string;
  transactionsFrozen?: boolean;
}

export default function EarningsPage() {
  const { data: session } = authClient.useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [siteConfig, setSiteConfig] = useState<{ enableCashOut?: boolean; minWithdrawalPoints?: number; pointToFiatRate?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, configRes] = await Promise.all([
          session?.user?.id ? api.get(`/user/profile`) : Promise.resolve(null),
          api.get(`/site-config`),
        ]);
        if (profileRes) setProfile(profileRes.data?.data);
        if (configRes) setSiteConfig(configRes.data?.data);
      } catch (err) {
        console.error("Failed to fetch profile or config", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawLoading(true);
    setMessage(null);
    try {
      await api.post('/withdrawals', {
        pointsRequested: Number(withdrawAmount),
        bankDetails
      });
      setMessage({ type: 'success', text: 'Withdrawal request submitted successfully! It is now pending review.' });
      setWithdrawAmount("");
      setBankDetails("");
      // Refresh profile points
      const res = await api.get(`/user/profile`);
      setProfile(res.data.data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit withdrawal' });
    } finally {
      setWithdrawLoading(false);
    }
  };

  const copyReferral = () => {
    if (!profile?.referralCode) return;
    const link = `${window.location.origin}/signup?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" /> Earnings & Referrals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your points, withdrawals, and refer friends to earn more.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-24 h-24 text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-muted-foreground mb-1">Available Points</p>
            <h2 className="text-4xl font-bold text-primary mb-2">{profile?.points?.toLocaleString() || 0}</h2>
            <p className="text-xs text-muted-foreground">Approx. ${( (profile?.points || 0) * 0.01 ).toFixed(2)} USD</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-24 h-24 text-emerald-500" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-muted-foreground mb-1">Today&apos;s Ad Earnings</p>
            <h2 className="text-4xl font-bold text-emerald-400 mb-2">{profile?.dailyAdPointsEarned || 0}</h2>
            <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
              <div 
                className="bg-emerald-400 h-1.5 rounded-full" 
                style={{ width: `${Math.min(((profile?.dailyAdPointsEarned || 0) / 1000) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Daily Limit: 1,000 Points</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Your Referral Code</p>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
            <code className="text-lg font-bold text-purple-400 flex-1">{profile?.referralCode}</code>
            <button onClick={copyReferral} className="p-2 hover:bg-white/10 rounded-lg transition" title="Copy Link">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Earn <strong className="text-white">10%</strong> of your referrals' ad earnings for their first 3 months!
          </p>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="glass rounded-2xl p-6 lg:p-8 border border-white/10 max-w-2xl">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          Request Withdrawal
        </h3>

        {profile?.transactionsFrozen ? (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Account Transactions Frozen</p>
              <p className="text-xs text-rose-400/80">
                Your account transactions have been frozen by moderation. Cashout is temporarily disabled. Please contact support.
              </p>
            </div>
          </div>
        ) : siteConfig?.enableCashOut === false ? (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Cashout / Manual Payouts Turned Off</p>
              <p className="text-xs text-amber-400/80">
                Manual cashout and payouts are currently paused by administration. Please check back later.
              </p>
            </div>
          </div>
        ) : null}
        
        <form onSubmit={handleWithdraw} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Points to Withdraw (Min. {siteConfig?.minWithdrawalPoints?.toLocaleString() || "1,000"})
            </label>
            <input
              type="number"
              min={siteConfig?.minWithdrawalPoints || 1000}
              max={profile?.points || 0}
              value={withdrawAmount}
              disabled={profile?.transactionsFrozen || siteConfig?.enableCashOut === false}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder={`e.g. ${siteConfig?.minWithdrawalPoints || 1000}`}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition disabled:opacity-50"
            />
            {Number(withdrawAmount) > 0 && (
              <p className="text-xs text-emerald-400 mt-2">
                You will receive approximately ${(Number(withdrawAmount) * (siteConfig?.pointToFiatRate || 0.01)).toFixed(2)} USD
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bank Details / Payout Destination</label>
            <textarea
              value={bankDetails}
              disabled={profile?.transactionsFrozen || siteConfig?.enableCashOut === false}
              onChange={(e) => setBankDetails(e.target.value)}
              placeholder="Provide your payment details (e.g., bKash / Nagad number or Bank info)..."
              required
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition resize-none disabled:opacity-50"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
              message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={
              profile?.transactionsFrozen ||
              siteConfig?.enableCashOut === false ||
              withdrawLoading ||
              !withdrawAmount ||
              Number(withdrawAmount) < (siteConfig?.minWithdrawalPoints || 1000) ||
              Number(withdrawAmount) > (profile?.points || 0)
            }
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2 w-full md:w-auto"
          >
            {withdrawLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : profile?.transactionsFrozen ? (
              "Account Has Been Frozen"
            ) : siteConfig?.enableCashOut === false ? (
              "Cashout Is Turned Off"
            ) : (
              <>
                <ArrowRight className="w-4 h-4" /> Submit Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
