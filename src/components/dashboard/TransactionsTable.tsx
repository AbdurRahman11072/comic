"use client";

import { useState } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { Search, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TransactionsTableProps {
  initialTransactions: any[];
}

export function TransactionsTable({ initialTransactions }: TransactionsTableProps) {
  const [search, setSearch] = useState("");

  const filteredTransactions = initialTransactions.filter(t => 
    t.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="glass p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10" 
            placeholder="Search transactions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable 
        data={filteredTransactions}
        columns={[
          { 
            header: "User", 
            accessor: (item: any) => (
              <div>
                <div className="font-bold">{item.user?.name || "Deleted User"}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{item.userId}</div>
              </div>
            )
          },
          { 
            header: "Type", 
            accessor: (item: any) => (
              <div className="flex items-center gap-2">
                {item.amount > 0 ? (
                  <ArrowUpRight className="w-3 h-3 text-green-400" />
                ) : (
                  <ArrowDownLeft className="w-3 h-3 text-red-400" />
                )}
                <span className="text-[10px] font-bold uppercase">{item.type}</span>
              </div>
            )
          },
          { 
            header: "Amount", 
            accessor: (item: any) => (
              <span className={`font-mono font-bold ${item.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                {item.amount > 0 ? "+" : ""}{item.amount} P
              </span>
            )
          },
          { header: "Description", accessor: "description", className: "text-muted-foreground text-sm" },
          { header: "Date", accessor: (item: any) => new Date(item.createdAt).toLocaleString(), className: "text-xs text-muted-foreground" },
        ]}
      />
      
      {filteredTransactions.length === 0 && <div className="text-center py-4 text-muted-foreground">No transactions found.</div>}
    </div>
  );
}
