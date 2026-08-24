import type { Metadata } from "next";
import { CreatorBenefitsClient } from "@/components/creator-benefits/CreatorBenefitsClient";
import { constructMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Join as a Creator | Genz Toon Creator Program",
    description: "Monetize your comics and webtoons with 70% direct revenue share, quality ad pools, and built-in fan communities.",
  });
}

export default function CreatorBenefitsPage() {
  return <CreatorBenefitsClient />;
}
