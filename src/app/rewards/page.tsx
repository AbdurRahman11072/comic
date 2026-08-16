import type { Metadata } from "next";
import { RewardsClient } from "@/components/rewards/RewardsClient";
import { constructMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Rewards & Free Points Center",
    description: "Complete daily ad packs, redeem creator promo codes, and earn free points to unlock premium manhwa & comic chapters.",
    keywords: ["free points", "rewards center", "earn points", "promo code redemption", "watch ads for points"],
  });
}

export default function RewardsPage() {
  return <RewardsClient />;
}
