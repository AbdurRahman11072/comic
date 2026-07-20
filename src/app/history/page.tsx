import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { userService } from "@/services/user.service";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HistoryPage() {
  const profileResponse = await userService.getProfile();
  const profileData = profileResponse?.data;

  if (!profileData) {
    redirect("/");
  }

  const history = profileData.history || [];




  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-[72rem] w-full mx-auto px-4 py-12 relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-heading tracking-tight mb-2">Reading History</h1>
          <p className="text-muted-foreground">Pick up where you left off.</p>
        </div>

        {history.length === 0 ? (
          <div className="glass rounded-[2rem] p-12 text-center text-muted-foreground border-white/5">
            <p>You haven't read any chapters yet.</p>
            <Link href="/" className="inline-block mt-4 text-primary hover:underline">
              Explore Series
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {history.map((item: any) => (
              <Link
                key={item.id}
                href={`/series/${item.series.slug}/chapter/${item.chapter.number}`}
                className="group relative flex flex-col gap-3"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass border-white/5">
                  <div
                    className="w-full h-full bg-white/5 bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                    style={item.series.coverUrl ? { backgroundImage: `url(${item.series.coverUrl})` } : undefined}
                  >
                    {!item.series.coverUrl && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">No Cover</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded-md">
                        Ch. {item.chapter.number}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {item.series.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Read {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
