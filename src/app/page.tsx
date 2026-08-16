import type { Metadata } from "next";
import { HomeClient } from "@/components/home/HomeClient";
import { constructMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata();
}

export default function HomePage() {
  return <HomeClient />;
}
