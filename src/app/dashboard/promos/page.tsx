import { promoService } from "@/services/promo.service";
import { PromoCodesClient } from "@/components/dashboard/promos/PromoCodesClient";

export const metadata = {
  title: "Promo & Coupon Codes | Dashboard",
  description: "Create 1-time reward & bulk chapter discount promo codes with custom expiry for your readers and campaigns.",
};

export default async function PromoCodesDashboardPage() {
  const res = await promoService.getPromoCodes();
  const promos = res.success && Array.isArray(res.data) ? res.data : [];

  return <PromoCodesClient initialPromos={promos} />;
}
