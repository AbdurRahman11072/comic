"use client";

import { useEffect, useState } from "react";
import { CreditCard, Check, X, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";

interface WithdrawalRequest {
  id: string;
  pointsRequested: number;
  fiatAmount: number;
  bankDetails: string;
  status: string;
  notes: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    points: number;
    dailyAdViews: number;
    dailyAdPointsEarned: number;
  };
}

export default function WithdrawalsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/moderator/withdrawals");
      setRequests(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch withdrawals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(id);
    try {
      await api.post(`/moderator/withdrawals/${id}/review`, {
        status,
        notes: status === "REJECTED" ? "Rejected by moderator" : "Approved",
      });
      fetchRequests();
    } catch (err) {
      console.error("Failed to review withdrawal", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No withdrawal requests
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="glass rounded-2xl p-6 border border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{req.user.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      req.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400" :
                      req.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>{req.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{req.user.email}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">Points Requested</p>
                      <p className="text-lg font-bold text-primary">{req.pointsRequested.toLocaleString()}</p>
                    </div>
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">Fiat Amount</p>
                      <p className="text-lg font-bold text-emerald-400">${req.fiatAmount.toFixed(2)}</p>
                    </div>
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">Today&apos;s Ad Views</p>
                      <p className="text-lg font-bold">{req.user.dailyAdViews}</p>
                    </div>
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">Today&apos;s Ad Points</p>
                      <p className="text-lg font-bold">{req.user.dailyAdPointsEarned}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Bank Details: {req.bankDetails}</span>
                  </div>
                </div>

                {req.status === "PENDING" && (
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleReview(req.id, "APPROVED")}
                      disabled={actionLoading === req.id}
                      className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition text-sm font-medium flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReview(req.id, "REJECTED")}
                      disabled={actionLoading === req.id}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm font-medium flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
