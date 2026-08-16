import type { Metadata } from "next";
import { ChannelClient } from "@/components/channel/ChannelClient";
import { constructMetadata } from "@/lib/metadata";
import { env } from "@/env";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/creators/channel/${id}`, {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    const profile = json?.data;
    if (profile) {
      return constructMetadata({
        title: `${profile.channelName} — Creator Studio`,
        description: profile.description || `Explore original manga, manhwa and comics created by ${profile.channelName}.`,
        image: profile.bannerUrl || profile.profileImage || undefined,
        keywords: [profile.channelName, "creator studio", "webtoon artist", "comic author"],
      });
    }
  } catch (e) {
    // fallback
  }

  return constructMetadata({
    title: "Creator Studio Channel",
    description: "Explore creator channels and comics.",
  });
}

export default async function CreatorChannelPage({ params }: Props) {
  const { id } = await params;
  return <ChannelClient channelId={id} />;
}
