import { DashboardLayout } from "@/components/DashboardLayout";
import { LayoutDashboard, Users, Wallet, Activity, Settings, FileText, Shield, Database, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

const mockPartners = [
  { id: "P001", name: "Digital Seva Kendra", status: "active", transactions: 12450, commission: 24500, wallet: 125000, plan: "Premium" },
  { id: "P002", name: "EasePay Solutions", status: "active", transactions: 8920, commission: 17800, wallet: 89000, plan: "Standard" },
  { id: "P003", name: "QuickBill Services", status: "pending", transactions: 3450, commission: 6900, wallet: 34500, plan: "Basic" },
  { id: "P004", name: "PaySmart Network", status: "active", transactions: 15670, commission: 31340, wallet: 156700, plan: "Premium" },
  { id: "P005", name: "BillEase Hub", status: "suspended", transactions: 0, commission: 0, wallet: 0, plan: "Basic" },
];

const AdminPartners = () => {
  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Partner Management" userRole="Super Admin">
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Partners</CardTitle>
              <Button>Add New Partner</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input placeholder="Search by Partner ID or Name..." />
              </div>
              <Button>Search</Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Wallet Balance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPartners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.id}</TableCell>
                    <TableCell>{partner.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{partner.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          partner.status === "active"
                            ? "default"
                            : partner.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {partner.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{partner.transactions.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{partner.commission.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{partner.wallet.toLocaleString()}</TableCell>
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

export default AdminPartners;
