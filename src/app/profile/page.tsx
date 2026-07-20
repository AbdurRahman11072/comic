import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { userService } from "@/services/user.service";
import { ProfileClient } from "@/components/dashboard/ProfileClient";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const res = await userService.getProfile();
  const profile = res?.data;

  if (!profile) {
    redirect("/"); // Or show a message
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12">
        <ProfileClient initialProfile={profile} />
      </main>
      <Footer />
    </div>
  );
}
