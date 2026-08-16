"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";

export function BecomeCreatorClient() {
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role;

  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.put("/creators/profile", { channelName, description });
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full relative z-10">
        {userRole === "creator" || userRole === "moderator" || userRole === "admin" ? (
          <div className="max-w-2xl mx-auto text-center py-20 glass p-10 rounded-3xl border border-white/5">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">You&apos;re Already a Creator!</h1>
            <p className="text-muted-foreground">Head to your dashboard to manage your series and chapters.</p>
            <a
              href="/dashboard/series"
              className="inline-block mt-6 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm"
            >
              Go to Creator Dashboard
            </a>
          </div>
        ) : success ? (
          <div className="max-w-2xl mx-auto text-center py-20 glass p-10 rounded-3xl border border-white/5">
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Welcome to Creator Studio!</h1>
            <p className="text-muted-foreground mb-6">
              Your creator profile has been set up. You can now start uploading your comics!
            </p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25"
            >
              Go to Creator Studio
            </a>
          </div>
        ) : (
          <div className="max-w-xl mx-auto space-y-8 glass p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Become a Verified Creator</h1>
              <p className="text-sm text-muted-foreground">
                Set up your official Creator Studio profile and start publishing your original manga & manhwa series.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Channel / Studio Name *
                </label>
                <input
                  type="text"
                  required
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="e.g. Phoenix Scans / Studio Eclipse"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Studio Bio / Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell readers about your team, translations, or creative works..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !channelName.trim()}
                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Register Creator Channel
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
