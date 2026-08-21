import { userService } from "@/services/user.service";
import { creatorService } from "@/services/creator.service";
import { ChannelManagerClient } from "@/components/dashboard/channel/ChannelManagerClient";

export const metadata = {
  title: "Channel Settings | Dashboard",
  description: "Customize your creator channel appearance, publish announcements, and review stats.",
};

export default async function ChannelSettingsPage() {
  const sessionData = await userService.getUserSession();
  const creatorId = sessionData?.user?.id;

  let profile = null;
  let posts: any[] = [];

  if (creatorId) {
    const [profileRes, postsRes] = await Promise.all([
      creatorService.getCreatorProfile(),
      creatorService.getCreatorPosts(creatorId),
    ]);

    profile = profileRes.success ? profileRes.data : null;
    posts = postsRes.success && Array.isArray(postsRes.data) ? postsRes.data : [];
  }

  return (
    <ChannelManagerClient
      initialProfile={profile}
      initialPosts={posts}
      creatorId={creatorId}
    />
  );
}
