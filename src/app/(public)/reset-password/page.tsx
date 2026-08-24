import { ResetPasswordClient } from "@/components/auth/ResetPasswordClient";
import { constructMetadata } from "@/lib/metadata";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Reset Password | Comic BD",
    description: "Choose a new secure password for your Comic BD account.",
  });
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
