"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "react-hot-toast";

function ReferralHandler() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  useEffect(() => {
    const ref = searchParams.get("ref") || searchParams.get("referral");
    if (ref && typeof window !== "undefined") {
      const cleanRef = ref.trim().toUpperCase();
      const previousRef = localStorage.getItem("comic_referral_code");

      if (cleanRef !== previousRef) {
        localStorage.setItem("comic_referral_code", cleanRef);
        if (!session?.user) {
          toast.success(`Referral code ${cleanRef} applied! Sign up to get bonus points.`, {
            id: "referral-toast",
            duration: 4000,
          });
        }
      }
    }
  }, [searchParams, session]);

  return null;
}

export function ReferralCapture() {
  return (
    <Suspense fallback={null}>
      <ReferralHandler />
    </Suspense>
  );
}
