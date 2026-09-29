import { DashboardLayout } from "@/components/DashboardLayout";
import { LayoutDashboard, Users, Wallet, Activity, Settings, FileText, Shield, Database, UserCheck, Globe, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NavLink } from "@/components/NavLink";

const AdminSidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin" },
    { icon: Users, label: "Partners", path: "/admin/partners" },
    { icon: UserCheck, label: "Users & KYC", path: "/admin/users" },
    { icon: Wallet, label: "Wallets & Finance", path: "/admin/wallets" },
    { icon: Activity, label: "Transactions", path: "/admin/transactions" },
    { icon: Database, label: "Bharat Connect", path: "/admin/bbps" },
    { icon: Shield, label: "Security & Compliance", path: "/admin/security" },
    { icon: FileText, label: "Reports", path: "/admin/reports" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  return (
    <nav className="p-4 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.path} to={item.path} end
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium">
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

const AdminSettings = () => {
  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="System Settings" userRole="Super Admin">
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Platform Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform Name</Label>
                <Input defaultValue="VasuPay" />
              </div>
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input defaultValue="support@vasupay.com" />
              </div>
              <div className="space-y-2">
                <Label>Support Phone</Label>
                <Input defaultValue="+91 1800-123-4567" />
              </div>
              <div className="space-y-2">
                <Label>Platform URL</Label>
                <Input defaultValue="https://vasupay.com" />
              </div>
            </div>
            <Button>Save Configuration</Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Master API Key</Label>
              <div className="flex gap-2">
                <Input type="password" defaultValue="••••••••••••••••" className="flex-1" />
                <Button variant="outline">Regenerate</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Webhook Secret</Label>
              <div className="flex gap-2">
                <Input type="password" defaultValue="••••••••••••••••" className="flex-1" />
                <Button variant="outline">Regenerate</Button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-medium">API Rate Limiting</p>
                <p className="text-sm text-muted-foreground">Limit requests per minute per key</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Partner Self-Registration</p>
                <p className="text-sm text-muted-foreground">Allow partners to register without admin approval</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto KYC Verification</p>
                <p className="text-sm text-muted-foreground">Enable automatic KYC verification using AI</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Enable system-wide maintenance mode</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>System Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Max Transaction Amount</Label>
                <Input defaultValue="50000" />
              </div>
              <div className="space-y-2">
                <Label>Daily Transaction Limit</Label>
                <Input defaultValue="200000" />
              </div>
              <div className="space-y-2">
                <Label>Min Wallet Balance</Label>
                <Input defaultValue="100" />
              </div>
            </div>
            <Button variant="secondary">Update Limits</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
