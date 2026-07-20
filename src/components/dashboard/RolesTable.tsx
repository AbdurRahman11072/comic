"use client";

import { DataTable } from "@/components/dashboard/DataTable";
import { Input } from "@/components/ui/input";
import { Search, Shield, ShieldAlert, UserCog } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export function RolesTable() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  
  // Dummy data for initial UI setup
  const [users, setUsers] = useState([
    { id: "1", name: "Alice", email: "alice@example.com", role: "admin", lastActive: "2023-10-01" },
    { id: "2", name: "Bob", email: "bob@example.com", role: "moderator", lastActive: "2023-10-02" },
    { id: "3", name: "Charlie", email: "charlie@example.com", role: "creator", lastActive: "2023-10-03" },
    { id: "4", name: "David", email: "david@example.com", role: "user", lastActive: "2023-10-04" },
  ]);

  const handleUpdateRole = (id: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    toast.success(`User role updated to ${newRole}`);
  };

  const filteredUsers = users.filter(u => 
    (u.name.toLowerCase().includes(search.toLowerCase()) || 
     u.email.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === "ALL" || u.role === roleFilter)
  );

  return (
    <div className="space-y-4">
      <div className="glass p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10" 
            placeholder="Search users by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="bg-background/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="creator">Creator</option>
          <option value="user">User</option>
        </select>
      </div>

      <DataTable 
        data={filteredUsers}
        columns={[
          { 
            header: "User", 
            accessor: (item: any) => (
              <div>
                <div className="font-bold">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.email}</div>
              </div>
            ) 
          },
          { 
            header: "Current Role", 
            accessor: (item: any) => (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                item.role === 'admin' ? 'text-purple-400 bg-purple-400/10 border border-purple-400/20' : 
                item.role === 'moderator' ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20' : 
                item.role === 'creator' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : 
                'text-muted-foreground bg-white/5 border border-white/10'
              }`}>
                {item.role}
              </span>
            )
          },
          { header: "Last Active", accessor: (item: any) => item.lastActive, className: "text-muted-foreground text-sm" },
          { 
            header: "Quick Actions", 
            accessor: (item: any) => (
              <div className="flex items-center justify-end gap-2">
                <button 
                  onClick={() => handleUpdateRole(item.id, 'admin')}
                  className={`p-2 rounded-lg transition-colors ${item.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'hover:bg-purple-500/10 hover:text-purple-500 text-muted-foreground'}`}
                  title="Make Admin"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleUpdateRole(item.id, 'moderator')}
                  className={`p-2 rounded-lg transition-colors ${item.role === 'moderator' ? 'bg-yellow-500/10 text-yellow-500' : 'hover:bg-yellow-500/10 hover:text-yellow-500 text-muted-foreground'}`}
                  title="Make Moderator"
                >
                  <Shield className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleUpdateRole(item.id, 'creator')}
                  className={`p-2 rounded-lg transition-colors ${item.role === 'creator' ? 'bg-emerald-500/10 text-emerald-500' : 'hover:bg-emerald-500/10 hover:text-emerald-500 text-muted-foreground'}`}
                  title="Make Creator"
                >
                  <UserCog className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleUpdateRole(item.id, 'user')}
                  className={`p-2 rounded-lg transition-colors ${item.role === 'user' ? 'bg-white/10 text-white' : 'hover:bg-white/10 hover:text-white text-muted-foreground'}`}
                  title="Make Regular User"
                >
                  <span className="text-xs font-bold w-4 h-4 flex items-center justify-center">U</span>
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
