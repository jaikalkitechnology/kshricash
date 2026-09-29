import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { LayoutDashboard, Users, Wallet, Zap, Settings, FileText, Activity, DollarSign, TrendingUp, Download } from "lucide-react";
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

const mockWalletTransactions = [
  { id: "W001", date: "2025-01-15", type: "Commission Credit", amount: 4680, balance: 125000 },
  { id: "W002", date: "2025-01-14", type: "Settlement", amount: -50000, balance: 120320 },
  { id: "W003", date: "2025-01-13", type: "Commission Credit", amount: 3780, balance: 170320 },
  { id: "W004", date: "2025-01-12", type: "Add Money", amount: 100000, balance: 166540 },
];

const PartnerWallet = () => {
  return (
    <DashboardLayout sidebar={<PartnerSidebar />} title="Wallet Management" userRole="Partner">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Wallet Balance" value="₹1,25,000" icon={Wallet} variant="default" />
          <StatCard title="This Month Commission" value="₹24,680" change={15} trend="up" icon={DollarSign} variant="accent" />
          <StatCard title="Pending Settlement" value="₹12,340" icon={TrendingUp} variant="warning" />
          <StatCard title="Total Earned" value="₹3.45L" icon={Activity} variant="success" />
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Wallet Transactions</CardTitle>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockWalletTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">{txn.id}</TableCell>
                    <TableCell>{txn.date}</TableCell>
                    <TableCell>{txn.type}</TableCell>
                    <TableCell className={`text-right font-semibold ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">₹{txn.balance.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Request Settlement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Available for Settlement</p>
                <p className="text-3xl font-bold">₹12,340</p>
              </div>
              <Button className="w-full">Request Settlement</Button>
              <p className="text-xs text-muted-foreground">
                Settlement will be processed within 2-3 business days
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Add Money</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <input className="w-full p-2 border rounded" placeholder="Enter amount" />
              </div>
              <Button className="w-full" variant="secondary">Add to Wallet</Button>
              <p className="text-xs text-muted-foreground">
                Funds will be available instantly
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PartnerWallet;
