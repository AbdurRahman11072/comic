import { CreatorBenefitsClient } from "@/components/creator-benefits/CreatorBenefitsClient";
import { constructMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Join as a Creator | Comic BD Creator Program",
    description: "Monetize your comics and webtoons with 100% direct revenue share, quality ad pools, and built-in fan communities.",
  });
}

export default function CreatorBenefitsPage() {
  return <CreatorBenefitsClient />;
}
