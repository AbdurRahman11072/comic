"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(token ? "verifying" : "error");
  const [errorMessage, setErrorMessage] = useState<string | null>(
    token ? null : "Missing email verification token."
  );
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!token || attemptedRef.current) return;
    attemptedRef.current = true;

    const performVerification = async () => {
      try {
        const res = await authClient.verifyEmail({
          query: { token },
        });

        if (res.error) {
          throw new Error(res.error.message || "Email verification failed or token expired.");
        }

        setStatus("success");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 3000);
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Failed to verify email. The link may have expired.");
      }
    };

    performVerification();
  }, [token, router]);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center p-4">
      {/* Decorative Blur Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl glass p-8 border border-white/10 space-y-6 shadow-2xl text-center">
        {status === "verifying" && (
          <div className="space-y-4 py-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto border border-primary/20">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-white">Verifying Your Email...</h1>
            <p className="text-xs text-muted-foreground">
              Please wait while we confirm your account details with the system.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white">Email Verified! 🎉</h1>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Your email address has been successfully confirmed. You're now ready to read, comment, and earn rewards.
              </p>
            </div>
            <p className="text-[11px] text-primary animate-pulse font-medium pt-2">
              Redirecting you to homepage...
            </p>
            <Link
              href="/"
              className="inline-block w-full py-3 rounded-full font-bold text-xs text-white text-center shadow-lg shadow-primary/25 hover:opacity-90 transition mt-2"
              style={{ background: "var(--primary)" }}
            >
              Continue to Homepage Now
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white">Verification Failed</h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {errorMessage || "The verification link is invalid, expired, or has already been used."}
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/"
                className="w-full py-3 rounded-full font-bold text-xs text-white text-center glass hover:bg-white/10 transition"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
