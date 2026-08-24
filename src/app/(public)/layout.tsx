import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { RouteAuthGuard } from "@/components/common/RouteAuthGuard";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <RouteAuthGuard />
      <Navbar />
      <main className="flex-1 relative">{children}</main>
      <Footer />
    </div>
  );
}
