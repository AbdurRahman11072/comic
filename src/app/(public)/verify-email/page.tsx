import { VerifyEmailClient } from "@/components/auth/VerifyEmailClient";
import { constructMetadata } from "@/lib/metadata";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Verify Email Address | Comic BD",
    description: "Verify your email address to activate your Comic BD account and rewards.",
  });
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
