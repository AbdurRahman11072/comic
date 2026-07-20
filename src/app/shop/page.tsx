"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { CreateCheckoutSessionAction } from "@/actions/payment";
import { Loader2, Zap, Shield, Rocket, Sparkles } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { LoginDialog } from "@/components/home/LoginDialog";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

const POINT_PACKAGES = [
  { id: 'pkg_1', points: 100, price: 1.00, name: '100 Points Starter', icon: Zap, color: "blue", popular: false },
  { id: 'pkg_2', points: 500, price: 4.50, name: '500 Points Pro', icon: Rocket, color: "purple", popular: true },
  { id: 'pkg_3', points: 1200, price: 10.00, name: '1200 Points Mega', icon: Shield, color: "green", popular: false },
  { id: 'pkg_4', points: 3000, price: 24.00, name: '3000 Points Ultimate', icon: Sparkles, color: "primary", popular: false },
];

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {

  const [loading, setLoading] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const { data: session } = useSession();



  const handlePurchase = async (packageId: string) => {
    if (!session) {
      setLoginOpen(true);
      return;
    }

    setLoading(packageId);
    try {
      const res = await CreateCheckoutSessionAction(packageId);
      if (res.success && res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initiate payment. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-[72rem] w-full mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-heading tracking-tight">Point Shop</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Get points to unlock premium chapters and support your favorite creators.
            Points never expire and can be used across all series.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {POINT_PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.id}
                className={`group relative flex flex-col p-8 rounded-3xl border glass transition-all duration-300 hover:scale-[1.02] ${pkg.popular ? "border-primary/50 shadow-2xl shadow-primary/10" : "border-white/5"
                  }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full z-10">
                    Most Popular
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl bg-${pkg.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 text-${pkg.color}`} />
                </div>

                <div className="space-y-1 mb-8">
                  <h3 className="text-lg font-bold">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">${pkg.price.toFixed(2)}</span>
                    <span className="text-muted-foreground text-sm">USD</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-coin/20 flex items-center justify-center">
                      <svg viewBox="0 0 20 20" width="12" height="12" className="text-coin fill-current">
                        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <text x="10" y="14.5" textAnchor="middle" fontSize="9" fontWeight="bold">P</text>
                      </svg>
                    </div>
                    <span className="font-semibold text-foreground">{pkg.points.toLocaleString()} Points</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Secure Checkout</span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading !== null}
                  className={`w-full py-6 rounded-2xl font-bold text-sm ${pkg.popular ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" : "bg-white/5 hover:bg-white/10"
                    }`}
                >
                  {loading === pkg.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Purchase Points"
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-16">
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-bold">Instant Delivery</h4>
            <p className="text-sm text-muted-foreground">Points are added to your account immediately after a successful checkout.</p>
          </div>
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="font-bold">Safe & Secure</h4>
            <p className="text-sm text-muted-foreground">Your transactions are handled by Stripe, a world leader in secure online payments.</p>
          </div>
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <h4 className="font-bold">Support Creators</h4>
            <p className="text-sm text-muted-foreground">Purchasing points directly supports the platform and the expansion of our library.</p>
          </div>
        </div>
      </main>

      <Footer />

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onAuthSuccess={() => setLoginOpen(false)}
      />
    </div>
  );
}
