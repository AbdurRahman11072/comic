"use client";

import { DataTable } from "@/components/dashboard/DataTable";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Shield, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { DeleteUserAction, UpdateUserAction } from "@/actions/user";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface UsersTableProps {
  initialUsers: any[];
  currentUserRole?: string;
}

export function UsersTable({ initialUsers, currentUserRole }: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterBanned, setFilterBanned] = useState("ALL");
  const router = useRouter();

  const isAdmin = currentUserRole === "ADMIN";

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action is irreversible.")) return;
    try {
      const res = await DeleteUserAction(id);
      if (res.success) {
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete user.");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user.");
    }
  };

  const handleRoleChange = async (user: any, newRole: string) => {
    if (user.role === newRole) return;
    if (!confirm(`Are you sure you want to change role to ${newRole}?`)) return;
    try {
      const res = await UpdateUserAction(user.id, { role: newRole });
      if (res.success) {
        toast.success("Role updated successfully.");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update role.");
      }
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("Failed to update role.");
    }
  };

  const handleBan = async (user: any) => {
    if (!confirm(`Are you sure you want to ${user.banned ? 'unban' : 'ban'} this user?`)) return;
    try {
      await api.post(`/moderator/users/${user.id}/ban`);
      router.refresh();
    } catch (error) {
      console.error("Failed to ban user:", error);
      toast.error("Failed to ban user.");
    }
  };

  const handleFreeze = async (user: any) => {
    if (!confirm(`Are you sure you want to ${user.transactionsFrozen ? 'unfreeze' : 'freeze'} transactions for this user?`)) return;
    try {
      await api.post(`/moderator/users/${user.id}/freeze`);
      router.refresh();
    } catch (error) {
      console.error("Failed to freeze user:", error);
      toast.error("Failed to freeze user.");
    }
  };

  const filteredUsers = initialUsers.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    const matchBanned = filterBanned === "ALL" || 
                        (filterBanned === "BANNED" && u.banned) || 
                        (filterBanned === "ACTIVE" && !u.banned);
    return matchSearch && matchRole && matchBanned;
  });

  return (
    <div className="space-y-4">
      <div className="glass p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="p-2 glass rounded-lg border border-white/10 text-sm outline-none bg-background/50"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">User</option>
            <option value="CREATOR">Creator</option>
            <option value="MODERATOR">Moderator</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select 
            value={filterBanned} 
            onChange={(e) => setFilterBanned(e.target.value)}
            className="p-2 glass rounded-lg border border-white/10 text-sm outline-none bg-background/50"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BANNED">Banned</option>
          </select>
        </div>
      </div>

      <DataTable 
        data={filteredUsers}
        columns={[
          { 
            header: "User", 
            accessor: (item: any) => (
              <div className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full border border-white/10" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div>
                  <div className="font-bold">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.email}</div>
                </div>
              </div>
            )
          },
          { 
            header: "Role", 
            accessor: (item: any) => (
              isAdmin ? (
                <select
                  value={item.role}
                  onChange={(e) => handleRoleChange(item, e.target.value)}
                  className={`p-1 rounded-md text-[10px] font-bold uppercase outline-none cursor-pointer ${
                    item.role === "ADMIN" ? "text-purple-400 bg-purple-400/10 border border-purple-400/20" : "text-foreground bg-white/5"
                  }`}
                >
                  <option value="USER">USER</option>
                  <option value="CREATOR">CREATOR</option>
                  <option value="MODERATOR">MODERATOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              ) : (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  item.role === "ADMIN" ? "text-purple-400 bg-purple-400/10 border border-purple-400/20" : "text-muted-foreground bg-white/5"
                }`}>
                  {item.role}
                </span>
              )
            )
          },
          { header: "Points", accessor: (item: any) => item.points.toLocaleString(), className: "font-mono" },
          { header: "Joined", accessor: (item: any) => new Date(item.createdAt).toLocaleDateString(), className: "text-muted-foreground" },
          { 
            header: "Actions", 
            accessor: (item: any) => (
              <div className="flex items-center justify-end gap-2">
                <button 
                  onClick={() => handleFreeze(item)}
                  className={`p-2 rounded-lg transition-colors ${item.transactionsFrozen ? 'bg-orange-500/10 text-orange-500' : 'hover:bg-orange-500/10 hover:text-orange-500 text-muted-foreground'}`}
                  title="Toggle Freeze Transactions"
                >
                  <span className="text-xs font-bold w-4 h-4 flex items-center justify-center">❄️</span>
                </button>
                <button 
                  onClick={() => handleBan(item)}
                  className={`p-2 rounded-lg transition-colors ${item.banned ? 'bg-red-500/10 text-red-500' : 'hover:bg-red-500/10 hover:text-red-500 text-muted-foreground'}`}
                  title="Toggle Ban"
                >
                  <span className="text-xs font-bold w-4 h-4 flex items-center justify-center">🚫</span>
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-muted-foreground"
                  title="Delete User"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
            className: "text-right"
          }
        ]}
      />
    </div>
  );
}
