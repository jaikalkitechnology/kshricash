import { DashboardLayout } from "@/components/DashboardLayout";
import { LayoutDashboard, Users, Wallet, Zap, Settings, FileText, Activity, Building, Palette, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NavLink } from "@/components/NavLink";

const PartnerSidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/partner" },
    { icon: Wallet, label: "Wallet", path: "/partner/wallet" },
    { icon: Zap, label: "Bharat Connect", path: "/partner/services" },
    { icon: Users, label: "Agents", path: "/partner/agents" },
    { icon: Activity, label: "Transactions", path: "/partner/transactions" },
    { icon: FileText, label: "Reports", path: "/partner/reports" },
    { icon: Settings, label: "Settings", path: "/partner/settings" },
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

const PartnerSettings = () => {
  return (
    <DashboardLayout sidebar={<PartnerSidebar />} title="Settings" userRole="Partner">
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input defaultValue="Digital Seva Kendra" />
              </div>
              <div className="space-y-2">
                <Label>Partner ID</Label>
                <Input defaultValue="P001" disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="partner@digitalse va.com" />
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input defaultValue="+91 9876543210" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Business Address</Label>
                <Input defaultValue="Shop No. 12, MG Road, Bangalore - 560001" />
              </div>
            </div>
            <Button>Update Information</Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding & White Label
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Logo Upload</Label>
              <Input type="file" accept="image/*" />
              <p className="text-xs text-muted-foreground">Recommended: 200x60px, PNG or JPG</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <Input type="color" defaultValue="#17786B" />
              </div>
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <Input type="color" defaultValue="#FF6B35" />
              </div>
            </div>
            <Button variant="secondary">Save Branding</Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Transaction Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified for all transactions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Agent Activity</p>
                <p className="text-sm text-muted-foreground">Notifications for agent actions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Settlement Updates</p>
                <p className="text-sm text-muted-foreground">Settlement status notifications</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PartnerSettings;
