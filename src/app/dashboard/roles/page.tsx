import { RolesTable } from "@/components/dashboard/RolesTable";

export default function RolesManagementPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Role Manager</h1>
        <p className="text-sm text-muted-foreground">Manage user roles and permissions globally.</p>
      </div>

      <RolesTable />
    </div>
  );
}
