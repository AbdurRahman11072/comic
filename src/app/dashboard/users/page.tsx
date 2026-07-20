import { UsersTable } from "@/components/dashboard/UsersTable";
import { userService } from "@/services/user.service";

export default async function UsersManagementPage() {
  const session = await userService.getUserSession();
  const role = session?.user?.role;

  const res = await userService.getAllUsers();
  const users = res?.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground">Manage user accounts, roles, and permissions.</p>
      </div>

      <UsersTable initialUsers={users} currentUserRole={role} />
    </div>
  );
}
