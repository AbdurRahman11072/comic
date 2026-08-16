import { AdsTable } from "@/components/dashboard/AdsTable";

export default function AdsManagementPage() {
  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-2xl font-bold">Ad Networks & Sponsor Management</h1>
        <p className="text-sm text-muted-foreground">Manage Google AdSense, AdMob, and Custom Sponsor campaigns.</p>
      </div>

      <AdsTable />
    </div>
  );
}
