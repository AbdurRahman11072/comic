import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: "primary" | "blue" | "green" | "purple";
}

const COLOR_MAP = {
  primary: "text-primary bg-primary/10 border-primary/20",
  blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  green: "text-green-500 bg-green-500/10 border-green-500/20",
  purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
};

export function StatCard({ label, value, change, isPositive, icon: Icon, color = "primary" }: StatCardProps) {
  return (
    <div className="glass p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          
          {change && (
            <p className={cn(
              "text-xs font-semibold mt-2 flex items-center gap-1",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              <span>{isPositive ? "↑" : "↓"}</span>
              {change}
              <span className="text-muted-foreground font-normal">vs last month</span>
            </p>
          )}
        </div>

        <div className={cn(
          "w-12 h-12 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110",
          COLOR_MAP[color]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
