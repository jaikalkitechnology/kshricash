import { DashboardLayout } from "@/components/DashboardLayout";
import { LayoutDashboard, Users, Wallet, Zap, Settings, FileText, Activity, Download, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

const mockTransactions = [
  { id: "TXN001", date: "2025-01-15 14:30", agent: "Rajesh Kumar", service: "Electricity", amount: 1200, commission: 30, status: "success" },
  { id: "TXN002", date: "2025-01-15 13:15", agent: "Priya Sharma", service: "Mobile", amount: 299, commission: 4.5, status: "success" },
  { id: "TXN003", date: "2025-01-15 12:00", agent: "Amit Patel", service: "Water", amount: 450, commission: 9, status: "success" },
  { id: "TXN004", date: "2025-01-15 10:45", agent: "Sneha Reddy", service: "Gas", amount: 850, commission: 17, status: "failed" },
  { id: "TXN005", date: "2025-01-14 18:30", agent: "Rajesh Kumar", service: "DTH", amount: 399, commission: 10, status: "success" },
  { id: "TXN006", date: "2025-01-14 16:20", agent: "Vikram Singh", service: "Electricity", amount: 1500, commission: 37.5, status: "success" },
  { id: "TXN007", date: "2025-01-14 14:10", agent: "Priya Sharma", service: "Mobile", amount: 599, commission: 9, status: "pending" },
];

const PartnerTransactions = () => {
  return (
    <DashboardLayout sidebar={<PartnerSidebar />} title="Transactions" userRole="Partner">
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Transactions</CardTitle>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input placeholder="Search by Transaction ID, Agent or Service..." />
              </div>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">{txn.id}</TableCell>
                    <TableCell className="text-sm">{txn.date}</TableCell>
                    <TableCell>{txn.agent}</TableCell>
                    <TableCell>{txn.service}</TableCell>
                    <TableCell className="text-right">₹{txn.amount}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">₹{txn.commission}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          txn.status === "success"
                            ? "default"
                            : txn.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
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

export default PartnerTransactions;
