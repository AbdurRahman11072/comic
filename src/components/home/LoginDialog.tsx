"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SITE_DEFAULTS } from "@/config/site";
import { authClient, signIn, signUp } from "@/lib/auth-client";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Gift,
  KeyRound,
  Mail,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { referralService } from "@/services/referral.service";

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

type Tab = "login" | "signup" | "forgot";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAuthSuccess?: () => void;
  initialTab?: Tab;
  initialReferralCode?: string;
}

export function LoginDialog({
  open,
  onOpenChange,
  onAuthSuccess,
  initialTab = "login",
  initialReferralCode = "",
}: LoginDialogProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(initialReferralCode);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referrerInfo, setReferrerInfo] = useState<{
    referrerName: string;
    signupBonusPoints: number;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setError(null);
    setLoading(false);
    setRetryCountdown(null);
    setForgotSuccess(false);
  };

  // Sync initial tab & referral code when opened
  useEffect(() => {
    if (open) {
      if (initialTab) setTab(initialTab);
      const savedRef =
        initialReferralCode ||
        (typeof window !== "undefined"
          ? localStorage.getItem("comic_referral_code") || ""
          : "");
      if (savedRef) {
        setReferralCode(savedRef.toUpperCase());
        setShowReferralInput(true);
        setTab("signup");
      }
    }
  }, [open, initialTab, initialReferralCode]);

  // Validate referral code when typed
  useEffect(() => {
    const code = referralCode.trim();
    if (!code || code.length < 3) {
      setReferrerInfo(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await referralService.validateReferralCode(code);
        if (res.success && res.data) {
          setReferrerInfo(res.data);
        } else {
          setReferrerInfo(null);
        }
      } catch (_err) {
        setReferrerInfo(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [referralCode]);

  useEffect(() => {
    if (retryCountdown === null || retryCountdown <= 0) return;
    const timer = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev === null || prev <= 1) {
          setError(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [retryCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (retryCountdown && retryCountdown > 0) return;

    setLoading(true);
    setError(null);

    try {
      if (tab === "forgot") {
        const res = await authClient.requestPasswordReset({
          email,
          redirectTo: "/reset-password",
        });
        if (res.error) throw new Error(res.error.message || "Failed to send reset link");
        setForgotSuccess(true);
      } else if (tab === "login") {
        const res = await signIn.email({ email, password });
        if (res.error) {
          const errMsg = res.error.message || "Login failed";
          const match = errMsg.match(/(\d+)\s*s/);
          if (match && match[1]) {
            setRetryCountdown(parseInt(match[1]));
          }
          throw new Error(errMsg);
        }
        reset();
        onAuthSuccess?.();
        onOpenChange(false);
      } else {
        const signupPayload: any = {
          email,
          password,
          name,
        };

        const cleanRef = referralCode.trim();
        if (cleanRef) {
          try {
            const valRes = await referralService.validateReferralCode(cleanRef);
            if (!valRes.success || !valRes.data) {
              throw new Error(`The referral code "${cleanRef}" does not exist. Please check the code or leave the field blank.`);
            }
          } catch (err: any) {
            throw new Error(err.message || `The referral code "${cleanRef}" is invalid.`);
          }
          signupPayload.referredByCode = cleanRef;
        }

        const res = await signUp.email(signupPayload);
        if (res.error) throw new Error(res.error.message || "Sign up failed");

        // Clean up referral stored in local storage upon successful registration
        if (typeof window !== "undefined") {
          localStorage.removeItem("comic_referral_code");
        }
        reset();
        onAuthSuccess?.();
        onOpenChange(false);
      }
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
          <div className="absolute inset-0 bg-gradient-to-t from-popover via-popover/60 to-transparent" />
          <div className="absolute bottom-3 left-6 right-6">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {SITE_DEFAULTS.appName}
            </h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {tab === "forgot"
                ? "Recover access to your reader account"
                : tab === "login"
                ? "Sign in to access your library and coins"
                : "Create an account to read and unlock rewards"}
            </p>
          </div>
        </div>

        {/* Form area */}
        <div className="p-6 pt-4 space-y-4">
          {/* Tabs or Back to Login */}
          {tab !== "forgot" ? (
            <div className="flex rounded-xl p-1 bg-white/5 border border-white/5">
              <button
                type="button"
                onClick={() => { setTab("login"); setError(null); }}
                className={`flex-1 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                  tab === "login"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab("signup"); setError(null); }}
                className={`flex-1 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                  tab === "signup"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setTab("login"); setError(null); setForgotSuccess(false); }}
              className="text-xs text-muted-foreground hover:text-white flex items-center gap-1.5 transition font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          )}

          {forgotSuccess ? (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Reset Link Sent!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If an account exists for <strong className="text-white">{email}</strong>, we've sent a password reset link. Please check your inbox and spam folder.
              </p>
              <Button
                type="button"
                onClick={() => { setTab("login"); setForgotSuccess(false); }}
                className="w-full h-10 rounded-full text-xs font-bold"
                style={{ background: "var(--primary)" }}
              >
                Return to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {tab === "signup" && (
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl px-4 py-2.5 text-[13px] bg-white/5 border border-white/10 outline-none focus:border-primary/60 transition-colors text-white"
                />
              )}

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-2.5 text-[13px] bg-white/5 border border-white/10 outline-none focus:border-primary/60 transition-colors text-white"
              />
              
              {/* Password Input with Show/Hide Toggle */}
              {tab !== "forgot" && (
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full rounded-xl pl-4 pr-11 py-2.5 text-[13px] bg-white/5 border border-white/10 outline-none focus:border-primary/60 transition-colors text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors p-1"
                      title={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {tab === "login" && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => { setTab("forgot"); setError(null); }}
                        className="text-[11px] text-muted-foreground hover:text-primary transition font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Referral Code section (Sign-up only) */}
              {tab === "signup" && (
                <div className="space-y-1.5 pt-1">
                  {!showReferralInput && !referralCode ? (
                    <button
                      type="button"
                      onClick={() => setShowReferralInput(true)}
                      className="text-xs text-primary/90 hover:text-primary flex items-center gap-1.5 font-medium transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5" /> Have a referral or invite code?
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Referral Code (e.g. CBD-7X9K2M)"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          className="w-full rounded-xl px-4 py-2.5 text-[13px] bg-white/5 border border-purple-500/30 outline-none focus:border-purple-500 transition-colors text-white font-mono uppercase"
                        />
                        {referrerInfo && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {referrerInfo && (
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                              Invited by <strong className="text-white">{referrerInfo.referrerName}</strong>
                            </span>
                          </div>
                          <span className="font-bold text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded-full">
                            +{referrerInfo.signupBonusPoints} Bonus Pts
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="text-[12px] text-red-400 bg-red-400/10 border border-red-500/20 rounded-xl px-3.5 py-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                  {retryCountdown !== null && retryCountdown > 0 && (
                    <p className="text-[11px] text-amber-300 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Retry available in {Math.floor(retryCountdown / 60)}m {retryCountdown % 60}s
                    </p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || (retryCountdown !== null && retryCountdown > 0)}
                className="h-11 rounded-full text-[14px] font-semibold mt-1 w-full"
                style={{ background: "var(--primary)" }}
              >
                {loading
                  ? "Please wait…"
                  : retryCountdown && retryCountdown > 0
                  ? `Wait ${retryCountdown}s`
                  : tab === "forgot"
                  ? "Send Reset Link"
                  : tab === "login"
                  ? "Sign In"
                  : "Create Account"}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
