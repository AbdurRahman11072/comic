import type { Metadata } from "next";
import { userService } from "@/services/user.service";
import { ProfileClient } from "@/components/dashboard/ProfileClient";
import { redirect } from "next/navigation";
import { constructMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "My Profile & Account Settings",
    description: "Manage your reader profile, points balance, transaction history, and account settings.",
    noIndex: true,
  });
}

export default async function ProfilePage() {
  const res = await userService.getProfile();
  const profile = res?.data;

  if (!profile) {
    redirect("/");
  }

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-12">
      <ProfileClient initialProfile={profile} />
    </div>
  );
}
