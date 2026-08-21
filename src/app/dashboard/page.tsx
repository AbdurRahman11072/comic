import { statsService } from "@/services/stats.service";
import { userService } from "@/services/user.service";
import { DashboardOverviewClient } from "@/components/dashboard/overview/DashboardOverviewClient";

export const metadata = {
  title: "Dashboard Overview | Genz Toon",
  description: "Live system overview, statistics, and platform analytics.",
};

export default async function DashboardPage() {
  const [statsRes, sessionData] = await Promise.all([
    statsService.getStats(),
    userService.getUserSession(),
  ]);

  const stats = statsRes.success ? statsRes.data : null;
  const user = sessionData?.user;

  return (
    <DashboardOverviewClient
      initialStats={stats}
      userName={user?.name || "User"}
      userRole={(user as any)?.role || "user"}
    />
  );
}
