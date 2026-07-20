"use client";

import { DataTable } from "@/components/dashboard/DataTable";
import { Input } from "@/components/ui/input";
import { Search, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export function CommentsTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Dummy data for initial UI setup
  const [comments, setComments] = useState([
    { id: "1", user: "Alice", content: "Great chapter!", status: "APPROVED", date: "2023-10-01" },
    { id: "2", user: "Bob", content: "Spam comment with link", status: "PENDING", date: "2023-10-02" },
    { id: "3", user: "Charlie", content: "Offensive language here", status: "REJECTED", date: "2023-10-03" }
  ]);

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    setComments(comments.filter(c => c.id !== id));
    toast.success("Comment deleted");
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setComments(comments.map(c => c.id === id ? { ...c, status: newStatus } : c));
    toast.success(`Comment marked as ${newStatus}`);
  };

  const filteredComments = comments.filter(c => 
    (c.content.toLowerCase().includes(search.toLowerCase()) || 
     c.user.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === "ALL" || c.status === statusFilter)
  );

  return (
    <div className="space-y-4">
      <div className="glass p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10" 
            placeholder="Search comments or users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="bg-background/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <DataTable 
        data={filteredComments}
        columns={[
          { header: "User", accessor: (item: any) => <span className="font-bold">{item.user}</span> },
          { header: "Comment", accessor: (item: any) => <span className="text-sm">{item.content}</span> },
          { 
            header: "Status", 
            accessor: (item: any) => (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                item.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : 
                item.status === 'REJECTED' ? 'text-red-400 bg-red-400/10 border border-red-400/20' : 
                'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20'
              }`}>
                {item.status}
              </span>
            )
          },
          { header: "Date", accessor: (item: any) => item.date, className: "text-muted-foreground" },
          { 
            header: "Actions", 
            accessor: (item: any) => (
              <div className="flex items-center justify-end gap-2">
                {item.status !== 'APPROVED' && (
                  <button 
                    onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                    className="p-2 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-lg transition-colors text-muted-foreground"
                    title="Approve"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {item.status !== 'REJECTED' && (
                  <button 
                    onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-muted-foreground"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-muted-foreground"
                  title="Delete"
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
