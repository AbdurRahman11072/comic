import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { userService } from "@/services/user.service";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
                className="group relative flex flex-col gap-3"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass border-white/5">
                  {bookmark.series.coverUrl ? (
                    <img
                      src={bookmark.series.coverUrl}
                      alt={bookmark.series.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">No Cover</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {bookmark.series.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bookmarked on {new Date(bookmark.createdAt).toLocaleDateString()}
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