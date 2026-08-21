import { userService } from "@/services/user.service";
import { creatorService } from "@/services/creator.service";
import { seriesService } from "@/services/series.service";
import { siteService } from "@/services/site.service";
import { FeaturedRequestsClient } from "@/components/dashboard/featured-requests/FeaturedRequestsClient";

export const metadata = {
  title: "Featured Placement Requests | Dashboard",
  description: "Request homepage featured banner placement for your series or review creator requests.",
};

export default async function FeaturedRequestsPage() {
  const sessionData = await userService.getUserSession();
  const role = (sessionData?.user as any)?.role?.toLowerCase() || "user";
  const isCreator = role === "creator";
  const isModOrAdmin = role === "moderator" || role === "admin";

  let requests: any[] = [];
  let seriesList: any[] = [];
  let userPoints = 0;
  let fee = 500;

  if (isCreator && sessionData?.user?.id) {
    const [reqRes, seriesRes, profileRes, configRes] = await Promise.all([
      creatorService.getCreatorFeatureRequests(),
      seriesService.getAllSeries({ creatorId: sessionData.user.id, limit: 100 }),
      userService.getProfile(),
      siteService.getSiteConfig(),
    ]);

    requests = reqRes.success && Array.isArray(reqRes.data) ? reqRes.data : [];
    seriesList = seriesRes.success && Array.isArray(seriesRes.data) ? seriesRes.data : [];
    userPoints = profileRes.success && profileRes.data?.points ? profileRes.data.points : 0;
    fee = configRes.success && configRes.data?.featuredRequestFee ? configRes.data.featuredRequestFee : 500;
  } else if (isModOrAdmin) {
    const reqRes = await creatorService.getModeratorFeaturedRequests();
    requests = reqRes.success && Array.isArray(reqRes.data) ? reqRes.data : [];
  }

  return (
    <FeaturedRequestsClient
      initialRequests={requests}
      initialSeriesList={seriesList}
      initialUserPoints={userPoints}
      initialFee={fee}
      initialRole={role}
    />
  );
}
