import type { Metadata } from "next";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { userService } from "@/services/user.service";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { constructMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "My Bookmarked Series",
    description: "Manage and read your favorite saved webtoons, manga, and manhwa series.",
    noIndex: true,
  });
}

export default async function BookmarksPage() {
  const profileResponse = await userService.getProfile();
  const profileData = profileResponse?.data;

  if (!profileData) {
    redirect("/");
  }

  const bookmarks = profileData.bookmarks || [];

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-[72rem] w-full mx-auto px-4 py-12 relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-heading tracking-tight mb-2">My Bookmarks</h1>
          <p className="text-muted-foreground">Series you have saved for later.</p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="glass rounded-[2rem] p-12 text-center text-muted-foreground border-white/5">
            <p>You haven't bookmarked any series yet.</p>
            <Link href="/" className="inline-block mt-4 text-primary hover:underline">
              Explore Series
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {bookmarks.map((bookmark: any) => (
              <Link 
                key={bookmark.id} 
                href={`/series/${bookmark.series.slug}`}
                className="group relative flex flex-col rounded-2xl overflow-hidden glass border border-white/5 hover:border-primary/50 transition-all duration-300"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                  <Image
                    src={bookmark.series.coverUrl || "/placeholder.jpg"}
                    alt={bookmark.series.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {bookmark.series.type}
                    </span>
                    <h3 className="font-bold text-sm leading-tight text-foreground line-clamp-1 mt-1 group-hover:text-primary transition-colors">
                      {bookmark.series.title}
                    </h3>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{bookmark.series._count?.chapters || 0} Chs</span>
                    <span className="text-[10px] text-primary/80 uppercase font-semibold">
                      {bookmark.series.status}
                    </span>
                  </div>
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