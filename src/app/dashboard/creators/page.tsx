import { creatorService } from "@/services/creator.service";
import { CreatorsDirectoryClient } from "@/components/dashboard/creators/CreatorsDirectoryClient";

export const metadata = {
  title: "Creator Studios & Channels | Dashboard",
  description: "Directory of all registered creators, public channel profiles, publication statistics, and earnings.",
};

export default async function AdminCreatorsDirectoryPage() {
  const res = await creatorService.getAllCreators();
  const creators = res.success && Array.isArray(res.data) ? res.data : [];

  return <CreatorsDirectoryClient initialCreators={creators} />;
}
