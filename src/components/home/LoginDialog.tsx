"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";

const COVERS = [
  "https://wsrv.nl/?url=cdn.meowing.org/uploads/H70SqQB-7tA&w=300",
  "https://wsrv.nl/?url=cdn.meowing.org/uploads/l0KAI2cQL-m&w=300",
  "https://wsrv.nl/?url=cdn.meowing.org/uploads/GmiNmtq2uI_&w=300",
  "https://wsrv.nl/?url=cdn.meowing.org/uploads/bqyzhwLhiYX&w=300",
  "https://wsrv.nl/?url=cdn.meowing.org/uploads/pQKszN7OYoV&w=300",
  "https://wsrv.nl/?url=cdn.meowing.org/uploads/alOTjyuN1G5&w=300",
  "https://wsrv.nl/?url=cdn.meowing.org/uploads/FcwKT4GYYyW&w=300",
  "https://wsrv.nl/?url=cdn.meowing.org/uploads/d8BKHPTZbCw&w=300",
];

function CoverCol({ images, offset }: { images: string[]; offset?: boolean }) {
  return (
    <div className={`flex flex-col gap-2 flex-shrink-0 ${offset ? "translate-y-10" : ""}`}>
      {images.map((img, i) => (
        <div
          key={i}
          className="w-20 min-h-[100px] rounded-lg bg-white/10 bg-center bg-cover flex-shrink-0"
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
    </div>
  );
}

type Tab = "login" | "signup";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAuthSuccess?: () => void;
}

export function LoginDialog({ open, onOpenChange, onAuthSuccess }: LoginDialogProps) {
  const [tab, setTab] = useState<Tab>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName(""); setEmail(""); setPassword(""); setError(null); setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (tab === "login") {
        const res = await signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message || "Login failed");
      } else {
        const res = await signUp.email({ email, password, name });
        if (res.error) throw new Error(res.error.message || "Sign up failed");
      }
      reset();
      onAuthSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="p-0 gap-0 max-w-[420px] w-full rounded-3xl overflow-hidden border-white/10 bg-popover">
        {/* Cover mosaic */}
        <div className="h-[160px] relative overflow-hidden bg-white/5 flex gap-2 p-3">
          <CoverCol images={[COVERS[0], COVERS[1]]} />
          <CoverCol images={[COVERS[2], COVERS[3]]} offset />
          <CoverCol images={[COVERS[4], COVERS[5]]} />
          <CoverCol images={[COVERS[6], COVERS[7]]} offset />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-popover pointer-events-none" />
        </div>

        {/* Body */}
        <div className="px-7 pt-4 pb-7">
          <DialogHeader className="mb-4 text-left">
            <DialogTitle className="text-[1.3rem] font-bold">
              {tab === "login" ? "Sign in" : "Create account"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground mt-1">
              {tab === "login"
                ? "Welcome back! Sign in to track progress and spend your points."
                : "Join Genz Toon and earn your first points today."}
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex rounded-full border border-white/10 p-0.5 mb-5 text-[13px]">
            {(["login", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); }}
                className="flex-1 rounded-full py-1.5 font-medium capitalize transition-all duration-200"
                style={{
                  background: tab === t ? "var(--primary)" : "transparent",
                  color: tab === t ? "#fff" : "var(--muted-foreground)",
                }}
              >
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {tab === "signup" && (
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-2.5 text-[13px] bg-white/5 border border-white/10 outline-none focus:border-primary/60 transition-colors"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-2.5 text-[13px] bg-white/5 border border-white/10 outline-none focus:border-primary/60 transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl px-4 py-2.5 text-[13px] bg-white/5 border border-white/10 outline-none focus:border-primary/60 transition-colors"
            />

            {error && (
              <p className="text-[12px] text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 rounded-full text-[14px] font-semibold mt-1"
              style={{ background: "var(--primary)" }}
            >
              {loading ? "Please wait…" : tab === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
