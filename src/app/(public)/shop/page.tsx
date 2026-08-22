import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";
import { constructMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Points & Coin Store",
    description: "Purchase points safely with Stripe to unlock fast-pass and premium chapters while supporting your favorite comic creators.",
    keywords: ["buy points", "coin store", "fast pass", "chapter purchases", "creator support"],
  });
}

export default function ShopPage() {
  return <ShopClient />;
}
