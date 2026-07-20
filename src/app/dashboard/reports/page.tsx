"use client";

import { DataTable } from "@/components/dashboard/DataTable";
import { Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

const REPORTS = [
  { id: "1", user: "John Doe", type: "Bug", subject: "Images not loading", priority: "High", status: "Pending", date: "2m ago" },
  { id: "2", user: "Jane Smith", type: "DMCA", subject: "Copyright claim #42", priority: "Urgent", status: "In Progress", date: "1h ago" },
  { id: "3", user: "Alex Wong", type: "Payment", subject: "Double charge issue", priority: "Medium", status: "Resolved", date: "3h ago" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Report Management</h1>
        <p className="text-sm text-muted-foreground">Handle user feedback, bug reports, and legal claims.</p>
      </div>

      <DataTable 
        data={REPORTS}
        columns={[
          { header: "User", accessor: "user" },
          { header: "Type", accessor: "type" },
          { header: "Subject", accessor: "subject", className: "max-w-xs truncate" },
          { 
            header: "Priority", 
            accessor: (item) => (
              <span className={`font-bold text-[11px] ${
                item.priority === "Urgent" ? "text-red-500" : item.priority === "High" ? "text-orange-500" : "text-blue-500"
              }`}>
                {item.priority}
              </span>
            )
          },
          { 
            header: "Status", 
            accessor: (item) => (
              <div className="flex items-center gap-2">
                {item.status === "Resolved" ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Clock className="w-3 h-3 text-yellow-500" />}
                <span>{item.status}</span>
              </div>
            )
          },
          { header: "Date", accessor: "date", className: "text-muted-foreground" },
        ]}
      />
    </div>
  );
}
