import {
  LayoutDashboard, Users, UserCheck, Wallet, Activity,
  DollarSign, Settings, Shield, Banknote, FileCheck,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";

interface EntitySidebarProps {
  basePath: string;
  canManageChildren: boolean;
}

const EntitySidebar = ({ basePath, canManageChildren }: EntitySidebarProps) => {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: basePath },
    ...(canManageChildren ? [
      { icon: Users, label: "Entities", path: `${basePath}/entities` },
      { icon: UserCheck, label: "KYC Approvals", path: `${basePath}/kyc` },
    ] : []),
    { icon: Wallet, label: "Wallet", path: `${basePath}/wallet` },
    { icon: Activity, label: "Transactions", path: `${basePath}/transactions` },
    { icon: DollarSign, label: "Commissions", path: `${basePath}/commissions` },
    { icon: Banknote, label: "Settlements", path: `${basePath}/settlements` },
    { icon: Shield, label: "Services", path: `${basePath}/services` },
    { icon: FileCheck, label: "My KYC", path: `${basePath}/kyc-submit` },
    { icon: Settings, label: "Settings", path: `${basePath}/settings` },
  ];

  return (
    <nav className="p-4 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === basePath}
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

export default EntitySidebar;
