"use client";

import { useState } from "react";
import {
  Search, Trash2, Shield, ShieldAlert, User as UserIcon,
  UserCog, Ban, Lock, VolumeX, CheckCircle2, AlertTriangle,
  RefreshCw, Filter, Sparkles
} from "lucide-react";
import {
  DeleteUserAction,
  UpdateUserAction,
  BanUserAction,
  FreezeUserAction,
  MuteUserAction,
} from "@/actions/user";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface UsersTableProps {
  initialUsers: any[];
  currentUserRole?: string;
}

export function UsersTable({ initialUsers, currentUserRole }: UsersTableProps) {
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  const isAdmin = currentUserRole?.toLowerCase() === "admin";

  const handleRoleChange = async (user: any, newRole: string) => {
    if (user.role === newRole) return;
    setUpdatingId(user.id);
    try {
      const res = await UpdateUserAction(user.id, { role: newRole });
      if (res.success) {
        toast.success(`Role for ${user.name} updated to ${newRole.toUpperCase()}`);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update role.");
      }
    } catch (_error) {
      toast.error("Failed to update user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBan = async (user: any) => {
    if (!confirm(`Are you sure you want to ${user.banned ? "unban" : "ban"} ${user.name}?`)) return;
    setUpdatingId(user.id);
    try {
      const res = await BanUserAction(user.id);
      if (res.success) {
        toast.success(user.banned ? "User unbanned." : "User banned.");
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, banned: !u.banned } : u)));
        router.refresh();
      } else {
        toast.error(res.message || "Failed to toggle ban status.");
      }
    } catch (_error) {
      toast.error("Failed to toggle ban status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFreeze = async (user: any) => {
    if (!confirm(`Are you sure you want to ${user.transactionsFrozen ? "unfreeze" : "freeze"} transactions for ${user.name}?`)) return;
    setUpdatingId(user.id);
    try {
      const res = await FreezeUserAction(user.id);
      if (res.success) {
        toast.success(user.transactionsFrozen ? "Transactions unfrozen." : "Transactions frozen.");
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, transactionsFrozen: !u.transactionsFrozen } : u)));
        router.refresh();
      } else {
        toast.error(res.message || "Failed to toggle transaction freeze.");
      }
    } catch (_error) {
      toast.error("Failed to toggle transaction freeze.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMute = async (user: any) => {
    setUpdatingId(user.id);
    try {
      const res = await MuteUserAction(user.id, { durationHours: 24 });
      if (res.success) {
        toast.success("User muted for 24 hours.");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to mute user.");
      }
    } catch (_error) {
      toast.error("Failed to mute user.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action is irreversible.")) return;
    try {
      const res = await DeleteUserAction(id);
      if (res.success) {
        toast.success("User account deleted.");
        setUsers((prev) => prev.filter((u) => u.id !== id));
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete user.");
      }
    } catch (error) {
      toast.error("Failed to delete user.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.id?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "ALL" || u.role?.toLowerCase() === filterRole.toLowerCase();
    const matchStatus =
      filterStatus === "ALL" ||
      (filterStatus === "BANNED" && u.banned) ||
      (filterStatus === "ACTIVE" && !u.banned) ||
      (filterStatus === "FROZEN" && u.transactionsFrozen);
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Search & Filters */}
      <div className="glass p-4 rounded-2xl border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by user name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary/50 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none"
            >
              <option value="ALL" className="bg-neutral-900">All Roles</option>
              <option value="admin" className="bg-neutral-900">Admins</option>
              <option value="moderator" className="bg-neutral-900">Moderators</option>
              <option value="creator" className="bg-neutral-900">Creators</option>
              <option value="user" className="bg-neutral-900">Standard Users</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none"
            >
              <option value="ALL" className="bg-neutral-900">All Statuses</option>
              <option value="ACTIVE" className="bg-neutral-900">Active</option>
              <option value="BANNED" className="bg-neutral-900">Banned</option>
              <option value="FROZEN" className="bg-neutral-900">Frozen Points</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users & Roles Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-muted-foreground uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-4 py-3.5">Assigned Role</th>
                <th className="px-4 py-3.5">Points Balance</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5 text-right">Moderation & Role Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition">
                    {/* User Info */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden shrink-0 flex items-center justify-center border border-white/10">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-xs text-white/80">{user.name?.[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">{user.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Selector */}
                    <td className="px-4 py-3.5">
                      {isAdmin ? (
                        <select
                          value={user.role?.toLowerCase()}
                          disabled={updatingId === user.id}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            user.role === "admin"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : user.role === "moderator"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : user.role === "creator"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-white/5 text-white/70 border-white/10"
                          }`}
                        >
                          <option value="user" className="bg-neutral-900 text-white">USER</option>
                          <option value="creator" className="bg-neutral-900 text-emerald-400">CREATOR</option>
                          <option value="moderator" className="bg-neutral-900 text-yellow-400">MODERATOR</option>
                          <option value="admin" className="bg-neutral-900 text-red-400">ADMIN</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            user.role === "admin"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : user.role === "moderator"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : user.role === "creator"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-white/10 text-white/70"
                          }`}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>

                    {/* Points Balance */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-amber-400">
                        {(user.points || 0).toLocaleString()} P
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {user.banned ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            BANNED
                          </span>
                        ) : user.transactionsFrozen ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            FROZEN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Mute 24h */}
                        <button
                          onClick={() => handleMute(user)}
                          disabled={updatingId === user.id}
                          className="p-2 rounded-lg glass glass-hover text-white/60 hover:text-amber-400 transition"
                          title="Mute 24 Hours"
                        >
                          <VolumeX className="w-3.5 h-3.5" />
                        </button>

                        {/* Freeze Transactions */}
                        <button
                          onClick={() => handleFreeze(user)}
                          disabled={updatingId === user.id}
                          className={`p-2 rounded-lg transition ${
                            user.transactionsFrozen
                              ? "bg-purple-500/20 text-purple-400"
                              : "glass glass-hover text-white/60 hover:text-purple-400"
                          }`}
                          title={user.transactionsFrozen ? "Unfreeze Transactions" : "Freeze Transactions"}
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>

                        {/* Ban / Unban */}
                        <button
                          onClick={() => handleBan(user)}
                          disabled={updatingId === user.id}
                          className={`p-2 rounded-lg transition ${
                            user.banned
                              ? "bg-red-500/30 text-red-300"
                              : "glass glass-hover text-white/60 hover:text-red-400"
                          }`}
                          title={user.banned ? "Unban User" : "Ban User"}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete User */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-muted-foreground text-sm">
                    No users matching your filters were found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
