import { ReactNode } from "react";
import { LayoutDashboard, Users, Receipt, Settings, FileText, CreditCard } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { NavLink } from "@/components/NavLink";
import { MobileBottomNav } from "@/components/vasu";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/agent" },
  { icon: Receipt, label: "Bharat Connect", path: "/agent/bbps" },
  { icon: Users, label: "Customers", path: "/agent/customers" },
  { icon: CreditCard, label: "Transactions", path: "/agent/transactions" },
  { icon: FileText, label: "Reports", path: "/agent/reports" },
  { icon: Settings, label: "Settings", path: "/agent/settings" },
];

const AgentSidebar = () => (
  <nav className="p-4 space-y-2">
    {navItems.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/agent"}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium"
        >
          <Icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      );
    })}
  </nav>
);

const agentBottomNav = (
  <MobileBottomNav
    items={[
      { label: "Home", icon: LayoutDashboard, path: "/agent", end: true },
      { label: "Customers", icon: Users, path: "/agent/customers" },
      { label: "History", icon: CreditCard, path: "/agent/transactions" },
      { label: "Reports", icon: FileText, path: "/agent/reports" },
    ]}
    center={{ label: "BBPS", icon: Receipt, path: "/agent/bbps" }}
  />
);

/** Agent app shell: branded sidebar (desktop) + bottom nav (mobile). */
export function AgentShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <DashboardLayout sidebar={<AgentSidebar />} title={title} userRole="Agent" bottomNav={agentBottomNav}>
      {children}
    </DashboardLayout>
  );
}
