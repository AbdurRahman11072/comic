import { AdsTable } from "@/components/dashboard/AdsTable";

export default function AdsManagementPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Custom Ads Management</h1>
        <p className="text-sm text-muted-foreground">Manage advertising campaigns and placements.</p>
      </div>

      <AdsTable />
    </div>
  );
}
