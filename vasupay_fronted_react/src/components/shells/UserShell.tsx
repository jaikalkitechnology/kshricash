import { ReactNode } from "react";
import { LayoutDashboard, Wallet, Zap, History, Gift, Settings } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { NavLink } from "@/components/NavLink";
import { MobileBottomNav } from "@/components/vasu";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/user" },
  { icon: Wallet, label: "My Wallet", path: "/user/wallet" },
  { icon: Zap, label: "Pay Bills", path: "/user/bills" },
  { icon: History, label: "Transactions", path: "/user/transactions" },
  { icon: Gift, label: "Rewards", path: "/user/rewards" },
  { icon: Settings, label: "Settings", path: "/user/settings" },
];

const UserSidebar = () => (
  <nav className="p-4 space-y-2">
    {navItems.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/user"}
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

const userBottomNav = (
  <MobileBottomNav
    items={[
      { label: "Home", icon: LayoutDashboard, path: "/user", end: true },
      { label: "Wallet", icon: Wallet, path: "/user/wallet" },
      { label: "History", icon: History, path: "/user/transactions" },
      { label: "Rewards", icon: Gift, path: "/user/rewards" },
    ]}
    center={{ label: "Pay Bills", icon: Zap, path: "/user/bills" }}
  />
);

/** Customer/User app shell: branded sidebar (desktop) + bottom nav (mobile). */
export function UserShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <DashboardLayout sidebar={<UserSidebar />} title={title} userRole="User" bottomNav={userBottomNav}>
      {children}
    </DashboardLayout>
  );
}
