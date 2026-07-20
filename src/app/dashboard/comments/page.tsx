import { CommentsTable } from "@/components/dashboard/CommentsTable";

export default function CommentsManagementPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Comments Management</h1>
        <p className="text-sm text-muted-foreground">Monitor and moderate user comments.</p>
      </div>

      <CommentsTable />
    </div>
  );
}
