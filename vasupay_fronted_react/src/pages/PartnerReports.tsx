import { DashboardLayout } from "@/components/DashboardLayout";
import { LayoutDashboard, Users, Wallet, Zap, Settings, FileText, Activity, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const reportTypes = [
  { name: "Daily Transaction Report", description: "All transactions for selected date" },
  { name: "Weekly Summary", description: "7-day transaction and commission summary" },
  { name: "Monthly Report", description: "Complete monthly performance report" },
  { name: "Agent Performance", description: "Individual agent transaction report" },
  { name: "Service-wise Report", description: "Breakdown by BBPS service type" },
  { name: "Commission Report", description: "Detailed commission earnings" },
  { name: "Settlement Report", description: "All settlement transactions" },
  { name: "Failed Transactions", description: "List of failed/pending transactions" },
];

const PartnerReports = () => {
  return (
    <DashboardLayout sidebar={<PartnerSidebar />} title="Reports" userRole="Partner">
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Transaction Report</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                    <SelectItem value="monthly">Monthly Report</SelectItem>
                    <SelectItem value="agent">Agent Performance</SelectItem>
                    <SelectItem value="service">Service-wise Report</SelectItem>
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
      </div>
    </DashboardLayout>
  );
};

export default PartnerReports;
