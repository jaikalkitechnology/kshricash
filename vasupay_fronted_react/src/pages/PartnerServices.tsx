import { DashboardLayout } from "@/components/DashboardLayout";
import { LayoutDashboard, Users, Wallet, Zap, Settings, FileText, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

const mockServices = [
  { name: "Electricity", billerCount: 45, status: "active", commission: "2.5%", transactions: 1240 },
  { name: "Water", billerCount: 28, status: "active", commission: "2.0%", transactions: 890 },
  { name: "Mobile Recharge", billerCount: 12, status: "active", commission: "1.5%", transactions: 2340 },
  { name: "Gas", billerCount: 18, status: "active", commission: "2.0%", transactions: 456 },
  { name: "DTH", billerCount: 8, status: "active", commission: "2.5%", transactions: 678 },
  { name: "Credit Card", billerCount: 15, status: "inactive", commission: "1.0%", transactions: 0 },
];

const PartnerServices = () => {
  return (
    <DashboardLayout sidebar={<PartnerSidebar />} title="Bharat Connect" userRole="Partner">
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Service Management</CardTitle>
              <Button>Configure New Service</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Billers</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockServices.map((service) => (
                  <TableRow key={service.name}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.billerCount} billers</TableCell>
                    <TableCell>{service.commission}</TableCell>
                    <TableCell className="text-right">{service.transactions.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={service.status === "active" ? "default" : "secondary"}>
                        {service.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch defaultChecked={service.status === "active"} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Manage</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PartnerServices;
