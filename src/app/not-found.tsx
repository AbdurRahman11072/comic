import Link from "next/link";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-5 p-8 rounded-3xl bg-neutral-900/50 border border-white/10 backdrop-blur-xl">
          <div className="text-6xl font-black text-primary tracking-tight">404</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
            <p className="text-sm text-neutral-400">
              The page you are looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition text-sm shadow-md"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
