import { redirect } from "next/navigation";

export default async function AdminSeriesRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (typeof v === "string") params.set(k, v);
  });
  const qs = params.toString();
  redirect(`/dashboard/series${qs ? `?${qs}` : ""}`);
}

