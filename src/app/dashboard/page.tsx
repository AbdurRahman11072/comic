"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { OverviewCharts } from "@/components/dashboard/OverviewCharts";
import { DataTable } from "@/components/dashboard/DataTable";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight 
} from "lucide-react";
import Link from "next/link";

const RECENT_REPORTS = [
  { id: "1", user: "John Doe", type: "Bug", subject: "Images not loading", status: "Pending", date: "2m ago" },
  { id: "2", user: "Jane Smith", type: "DMCA", subject: "Copyright claim #42", status: "In Progress", date: "1h ago" },
  { id: "3", user: "Alex Wong", type: "Payment", subject: "Double charge issue", status: "Resolved", date: "3h ago" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">System Overview</h1>
          <p className="text-muted-foreground text-sm">Welcome back, Admin. Here's what's happening with Genz Toon today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-500 uppercase tracking-widest">Live Systems</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Users" 
          value="12.4k" 
          change="12%" 
          isPositive 
          icon={Users} 
          color="blue"
        />
        <StatCard 
          label="Active Series" 
          value="842" 
          change="4.2%" 
          isPositive 
          icon={BookOpen} 
          color="purple"
        />
        <StatCard 
          label="Monthly Views" 
          value="1.2M" 
          change="8.5%" 
          isPositive 
          icon={TrendingUp} 
          color="primary"
        />
        <StatCard 
          label="Net Revenue" 
          value="$45,210" 
          change="2.1%" 
          isPositive 
          icon={DollarSign} 
          color="green"
        />
      </div>

      {/* Charts */}
      <OverviewCharts />

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Recent Urgent Reports</h3>
          <Link 
            href="/dashboard/reports" 
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View all reports <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        
        <DataTable 
          data={RECENT_REPORTS}
          columns={[
            { header: "User", accessor: "user" },
            { header: "Type", accessor: "type" },
            { header: "Subject", accessor: "subject" },
            { 
              header: "Status", 
              accessor: (item) => (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                  item.status === "Resolved" ? "bg-green-500/10 text-green-500" :
                  item.status === "Pending" ? "bg-red-500/10 text-red-500" :
                  "bg-blue-500/10 text-blue-500"
                }`}>
                  {item.status}
                </span>
              )
            },
            { header: "Date", accessor: "date", className: "text-muted-foreground" },
          ]}
        />
      </div>
    </div>
  );
}
