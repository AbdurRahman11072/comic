"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DemoPayWebhookAction } from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { CreditCard, Shield, ArrowLeft, Loader2, Landmark, CheckCircle, Info } from "lucide-react";
import Link from "next/link";

const POINT_PACKAGES = [
  { id: 'pkg_1', points: 100, price: 1.00, name: '100 Points Starter' },
  { id: 'pkg_2', points: 500, price: 4.50, name: '500 Points Pro' },
  { id: 'pkg_3', points: 1200, price: 10.00, name: '1200 Points Mega' },
  { id: 'pkg_4', points: 3000, price: 24.00, name: '3000 Points Ultimate' },
];

export default function StripeSandboxPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SandboxContent />
    </Suspense>
  );
}

function SandboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();

  const packageId = searchParams.get("packageId") || "pkg_1";
  const checkoutUrl = searchParams.get("checkoutUrl");

  const pkg = POINT_PACKAGES.find((p) => p.id === packageId) || POINT_PACKAGES[0];

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefilled mock values
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12 / 30");
  const [cvc, setCvc] = useState("123");

  useEffect(() => {
    if (session?.user) {
      setEmail(session.user.email || "");
      setName(session.user.name || "");
    }
  }, [session]);

  const handleDemoPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      setError("You must be logged in to make a purchase.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await DemoPayWebhookAction(session.user.id, pkg.id, pkg.points);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/shop?success=true");
        }, 1500);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong processing mock payment.");
      setLoading(false);
    }
  };

  const handleRealStripe = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      setError("Stripe Checkout URL not available.");
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0d0f12] text-slate-100 font-sans">
      <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto my-0 md:my-8 bg-[#13161c] md:rounded-3xl border border-slate-800/60 shadow-2xl overflow-hidden">
        {/* Left Side: Summary */}
        <div className="flex-1 p-8 md:p-12 bg-slate-950/40 border-r border-slate-800/30 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Link href="/shop" className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <span className="text-sm font-semibold tracking-wider uppercase text-rose-500">Genz Toon Sandbox</span>
            </div>

            <div className="space-y-4">
              <div className="text-slate-400 text-sm font-medium">Pay Genz Toon</div>
              <div className="text-4xl font-extrabold text-white tracking-tight">
                ${pkg.price.toFixed(2)}
              </div>
              <div className="text-xl font-semibold text-rose-400 flex items-center gap-2">
                <span>{pkg.points.toLocaleString()} Points</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-normal">Package</span>
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{pkg.name}</span>
                <span className="text-white font-medium">${pkg.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-800/30 pt-4 font-semibold">
                <span className="text-slate-200">Amount due</span>
                <span className="text-white">${pkg.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/40 flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Mock Stripe Sandbox Mode. No real money will be charged.</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          {success ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-500">
                <CheckCircle className="w-10 h-10 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-white">Payment Success!</h2>
              <p className="text-slate-400 text-sm max-w-sm">
                Points have been successfully added to your account. Redirecting you back to the Shop...
              </p>
            </div>
          ) : (
            <form onSubmit={handleDemoPay} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Pay with card (Test Mode)</h2>
                <p className="text-slate-400 text-xs">
                  We've autofilled the fields with demo test card information for you.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-slate-400">Email address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="card" className="text-xs font-semibold text-slate-400">Card information</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="card"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 transition-colors pl-10"
                      placeholder="1234 5678 1234 5678"
                    />
                    <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="flex gap-0 -mt-px">
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-1/2 bg-slate-900 border border-slate-800 rounded-bl-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 transition-colors text-center"
                      placeholder="MM / YY"
                    />
                    <input
                      type="text"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-1/2 bg-slate-900 border border-slate-800 rounded-br-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 transition-colors text-center -ml-px"
                      placeholder="CVC"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-slate-400">Cardholder name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Demo Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Demo Pay (${pkg.price.toFixed(2)})</span>
                    </>
                  )}
                </Button>

                {checkoutUrl && (
                  <Button
                    type="button"
                    onClick={handleRealStripe}
                    variant="outline"
                    className="w-full py-6 rounded-2xl border-slate-800 hover:bg-slate-900 hover:text-white font-semibold text-sm text-slate-300"
                  >
                    <Landmark className="w-4 h-4 mr-2" />
                    Proceed to Real Stripe Hosted Page
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
