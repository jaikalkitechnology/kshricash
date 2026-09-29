import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  trend?: "up" | "down";
  variant?: "default" | "accent" | "success" | "warning";
}

export function StatCard({ title, value, change, icon: Icon, trend, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "bg-gradient-primary text-primary-foreground",
    accent: "bg-gradient-accent text-accent-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
  };

  return (
    <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-display text-3xl font-semibold tracking-tight">{value}</p>
          {change !== undefined && (
            <div className={cn(
              "flex items-center text-sm font-medium gap-1",
              trend === "up" ? "text-success" : "text-destructive"
            )}>
              {trend === "up" ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", variantStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
