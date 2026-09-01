import type { Metadata } from "next";
import { userService } from "@/services/user.service";
import { redirect } from "next/navigation";
import { constructMetadata } from "@/lib/metadata";
import { SecurityPageClient } from "./SecurityPageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Account Security & Password Change",
    description: "Update your password and manage account security on Comic BD.",
    keywords: ["security", "password change", "account protection"],
    noIndex: true,
  });
}

export default async function SecurityPage() {
  const res = await userService.getProfile();
  const profile = res?.data;

  if (!profile) {
    redirect("/");
  }

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-8 sm:py-12">
      <SecurityPageClient profile={profile} />
    </div>
  );
}
