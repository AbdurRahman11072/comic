import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { SeriesForm } from "@/components/series/SeriesForm";

export default function AddSeriesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-background relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 py-10">
          <SeriesForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
