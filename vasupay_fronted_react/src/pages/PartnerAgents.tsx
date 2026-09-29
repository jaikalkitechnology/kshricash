import { DashboardLayout } from "@/components/DashboardLayout";
import { LayoutDashboard, Users, Wallet, Zap, Settings, FileText, Activity, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const mockAgents = [
  { id: "A001", name: "Rajesh Kumar", mobile: "9876543210", transactions: 234, commission: 4680, wallet: 12500, status: "active", kycStatus: "verified" },
  { id: "A002", name: "Priya Sharma", mobile: "9123456780", transactions: 189, commission: 3780, wallet: 8900, status: "active", kycStatus: "verified" },
  { id: "A003", name: "Amit Patel", mobile: "9988776655", transactions: 156, commission: 3120, wallet: 5600, status: "inactive", kycStatus: "pending" },
  { id: "A004", name: "Sneha Reddy", mobile: "9876123450", transactions: 278, commission: 5560, wallet: 15600, status: "active", kycStatus: "verified" },
  { id: "A005", name: "Vikram Singh", mobile: "9765432109", transactions: 92, commission: 1840, wallet: 3200, status: "active", kycStatus: "verified" },
];

const PartnerAgents = () => {
  return (
    <DashboardLayout sidebar={<PartnerSidebar />} title="Agent Management" userRole="Partner">
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Agents</CardTitle>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Agent
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Wallet</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.id}</TableCell>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>{agent.mobile}</TableCell>
                    <TableCell className="text-right">{agent.transactions}</TableCell>
                    <TableCell className="text-right">₹{agent.commission}</TableCell>
                    <TableCell className="text-right">₹{agent.wallet}</TableCell>
                    <TableCell>
                      <Badge variant={agent.kycStatus === "verified" ? "default" : "secondary"}>
                        {agent.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                        {agent.status}
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

export default PartnerAgents;
