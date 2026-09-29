import { DashboardLayout } from "@/components/DashboardLayout";
import { LayoutDashboard, Users, Wallet, Activity, Settings, FileText, Shield, Database, UserCheck, Lock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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

const securityAlerts = [
  { id: 1, type: "warning", message: "3 failed login attempts from IP: 192.168.1.100", time: "5 mins ago" },
  { id: 2, type: "info", message: "SSL certificate will expire in 30 days", time: "1 hour ago" },
  { id: 3, type: "critical", message: "Unusual transaction pattern detected from Partner P003", time: "2 hours ago" },
];

const AdminSecurity = () => {
  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Security & Compliance" userRole="Super Admin">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Security Score</p>
                  <p className="text-3xl font-bold">92/100</p>
                </div>
                <Shield className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">PCI-DSS Status</p>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <Lock className="h-12 w-12 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Active Alerts</p>
                  <p className="text-3xl font-bold text-warning">3</p>
                </div>
                <AlertTriangle className="h-12 w-12 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Security Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {securityAlerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    alert.type === "critical" ? "text-destructive" : 
                    alert.type === "warning" ? "text-warning" : "text-primary"
                  }`} />
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Security Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication (2FA)</p>
                <p className="text-sm text-muted-foreground">Enforce 2FA for all admin users</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">IP Whitelisting</p>
                <p className="text-sm text-muted-foreground">Restrict access by IP address</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Rate Limiting</p>
                <p className="text-sm text-muted-foreground">Limit API requests per minute</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Transaction Monitoring</p>
                <p className="text-sm text-muted-foreground">AI-powered fraud detection</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">PCI-DSS Compliance</p>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Last audit: 15 Dec 2024</p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">GDPR Compliance</p>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Data retention: 90 days</p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">RBI Guidelines</p>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Last review: 10 Jan 2025</p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Data Encryption</p>
                  <Badge variant="default">AES-256</Badge>
                </div>
                <p className="text-sm text-muted-foreground">All data encrypted at rest</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminSecurity;
