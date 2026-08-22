import type { Metadata } from "next";
import { userService } from "@/services/user.service";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { constructMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "My Reading History",
    description: "View and resume your recently read comic chapters and webtoons.",
    noIndex: true,
  });
}

export default async function HistoryPage() {
  const profileResponse = await userService.getProfile();
  const profileData = profileResponse?.data;

  if (!profileData) {
    redirect("/");
  }

  const history = profileData.history || [];

  return (
    <div className="max-w-[72rem] w-full mx-auto px-4 py-12 relative z-10">
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
                href={`/series/${item.series.slug}/${item.chapter?.number || 1}`}
                className="group relative flex flex-col rounded-2xl overflow-hidden glass border border-white/5 hover:border-primary/50 transition-all duration-300"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                  <Image
                    src={item.series.coverUrl || "/placeholder.jpg"}
                    alt={item.series.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-md rounded-lg p-2 border border-white/10">
                    <span className="text-[10px] text-muted-foreground block">Last Read:</span>
                    <span className="text-xs font-bold text-primary block truncate">
                      Chapter {item.chapter?.number || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {item.series.type}
                    </span>
                    <h3 className="font-bold text-sm leading-tight text-foreground line-clamp-1 mt-1 group-hover:text-primary transition-colors">
                      {item.series.title}
                    </h3>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
}
