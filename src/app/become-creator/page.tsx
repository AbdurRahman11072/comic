import type { Metadata } from "next";
import { BecomeCreatorClient } from "@/components/creator/BecomeCreatorClient";
import { constructMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Become a Creator — Creator Studio Application",
    description: "Publish your original manga, manhwa, and comics on our platform. Reach thousands of daily readers and monetize your content.",
    keywords: ["become a creator", "publish comic", "creator application", "monetize webtoon"],
  });
}

export default function BecomeCreatorPage() {
  return <BecomeCreatorClient />;
}
