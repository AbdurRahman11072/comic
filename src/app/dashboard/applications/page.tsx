"use client";

import { useEffect, useState } from "react";
import { FileText, Check, X, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface Application {
  id: string;
  title: string;
  description: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      const res = await api.get("/moderator/series-applications");
      setApplications(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(id);
    try {
      await api.post(`/moderator/series-applications/${id}/review`, { status });
      fetchApplications();
    } catch (err) {
      console.error("Failed to review application", err);
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
        <FileText className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">Series Applications</h1>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No applications to review
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="glass rounded-2xl p-6 border border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{app.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{app.description || "No description"}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span>By: <strong className="text-white">{app.creator.name}</strong></span>
                    <span>•</span>
                    <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      app.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400" :
                      app.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>{app.status}</span>
                  </div>
                </div>

                {app.status === "PENDING" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReview(app.id, "APPROVED")}
                      disabled={actionLoading === app.id}
                      className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition text-sm font-medium flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReview(app.id, "REJECTED")}
                      disabled={actionLoading === app.id}
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
