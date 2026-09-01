import type { Metadata } from "next";
import { userService } from "@/services/user.service";
import { redirect } from "next/navigation";
import { constructMetadata } from "@/lib/metadata";
import { ProfileSidebar } from "@/components/dashboard/profile/ProfileSidebar";
import { ReferralsTab } from "@/components/dashboard/profile/ReferralsTab";
import { ReferralsPageClient } from "./ReferralsPageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Referrals & Rewards — Invite Friends",
    description: "Share your referral link, invite friends, and earn bonus reading points on Comic BD.",
    keywords: ["referrals", "earn points", "invite friends", "rewards"],
    noIndex: true,
  });
}

export default async function ReferralsPage() {
  const res = await userService.getProfile();
  const profile = res?.data;

  if (!profile) {
    redirect("/");
  }

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-8 sm:py-12">
      <ReferralsPageClient profile={profile} />
    </div>
  );
}
