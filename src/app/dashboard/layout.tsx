import { Sidebar } from "@/components/dashboard/Sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["creator", "moderator", "admin"];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const backendUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    "http://localhost:5000";

  try {
    const res = await fetch(`${backendUrl}/api/auth/get-session`, {
      headers: {
        cookie: cookieStore.toString(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      redirect("/");
    }

    const sessionData = await res.json();
    const userRole = sessionData?.user?.role || "user";

    if (!sessionData?.user || !ALLOWED_ROLES.includes(userRole)) {
      redirect("/");
    }
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    // If backend is unreachable or not ready, fallback to proxy.ts middleware protection
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      {/* Background atmosphere */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar />

      <main className="flex-1 md:ml-64 relative min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-[90]">
          <div className="text-sm text-muted-foreground font-medium">
            Dashboard
          </div>
        </header>

        <div className="p-6 lg:p-10 flex-1">{children}</div>
      </main>
    </div>
  );
}
