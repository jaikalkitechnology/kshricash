import { DashboardLayout } from "@/components/DashboardLayout";
import { LayoutDashboard, Users, Wallet, Activity, Settings, FileText, Shield, Database, UserCheck, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const reportTypes = [
  { name: "Platform Revenue Report", description: "Complete revenue breakdown by service and partner" },
  { name: "Transaction Volume Report", description: "Daily/Weekly/Monthly transaction statistics" },
  { name: "Partner Performance Report", description: "Individual partner metrics and commissions" },
  { name: "Failed Transaction Report", description: "Analysis of failed/pending transactions" },
  { name: "User Activity Report", description: "User engagement and transaction patterns" },
  { name: "Commission Report", description: "Total commissions paid to partners" },
  { name: "Settlement Report", description: "All settlement transactions and pending approvals" },
  { name: "Compliance Report", description: "KYC status, security audits, and compliance metrics" },
  { name: "BBPS Service Report", description: "Service-wise transaction and revenue breakdown" },
  { name: "Custom Analytics", description: "Build custom reports with filters" },
];

const AdminReports = () => {
  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Reports & Analytics" userRole="Super Admin">
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Platform Revenue</SelectItem>
                    <SelectItem value="transaction">Transaction Volume</SelectItem>
                    <SelectItem value="partner">Partner Performance</SelectItem>
                    <SelectItem value="failed">Failed Transactions</SelectItem>
                    <SelectItem value="custom">Custom Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Period</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <input type="date" className="w-full p-2 border rounded" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <input type="date" className="w-full p-2 border rounded" />
              </div>
            </div>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate & Download Report
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((report) => (
                <div key={report.name} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Scheduled Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Transaction Summary</p>
                  <p className="text-sm text-muted-foreground">Email to: admin@vasupay.com • Every day at 6:00 AM</p>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <div className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Partner Performance</p>
                  <p className="text-sm text-muted-foreground">Email to: finance@vasupay.com • Every Monday at 9:00 AM</p>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">Schedule New Report</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
