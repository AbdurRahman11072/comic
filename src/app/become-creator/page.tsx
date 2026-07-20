"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import api from "@/lib/api";

export default function BecomeCreatorPage() {
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role;
  
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (userRole === "creator" || userRole === "moderator" || userRole === "admin") {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">You&apos;re Already a Creator!</h1>
        <p className="text-muted-foreground">Head to your dashboard to manage your series and chapters.</p>
      </div>
    );
  }

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

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Welcome to Creator Studio!</h1>
        <p className="text-muted-foreground mb-6">Your creator profile has been set up. You can now start uploading your comics!</p>
        <a href="/dashboard" className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition">
          Go to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="text-center mb-10">
        <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Become a Creator</h1>
        <p className="text-muted-foreground">Set up your creator profile and start publishing your comics to the world.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 glass rounded-2xl p-8 border border-white/10">
        <div>
          <label className="block text-sm font-medium mb-2">Channel Name</label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="e.g. MangaMaster Studio"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell readers about yourself and what kind of content you create..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition resize-none"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !channelName.trim()}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Setting up..." : "Start Creating"}
        </button>
      </form>
    </div>
  );
}
