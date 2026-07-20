import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

        <div className="p-6 lg:p-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
