import {
  LayoutDashboard, Users, Wallet, Activity, Shield, FileText,
  Settings, UserCheck, Banknote, MessageSquare, ScrollText,
  DollarSign, Database, UserPlus, Network,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: UserCheck, label: "KYC Management", path: "/admin/kyc" },
  { icon: Wallet, label: "Wallets", path: "/admin/wallets" },
  { icon: Activity, label: "Transactions", path: "/admin/transactions" },
  { icon: Banknote, label: "Settlements", path: "/admin/settlements" },
  { icon: DollarSign, label: "Commissions", path: "/admin/commissions" },
  { icon: MessageSquare, label: "Support Tickets", path: "/admin/tickets" },
  { icon: ScrollText, label: "Audit Logs", path: "/admin/logs" },
  { icon: Network, label: "Integration Logs", path: "/admin/audit-logs" },
  { icon: Database, label: "Bharat Connect", path: "/admin/bbps" },
  { icon: UserPlus, label: "Agent Registration", path: "/admin/agent-registration" },
  { icon: Shield, label: "Security", path: "/admin/security" },
  { icon: FileText, label: "Reports", path: "/admin/reports" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

const AdminSidebar = () => {
  return (
    <nav className="p-4 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
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
};

export default AdminSidebar;
