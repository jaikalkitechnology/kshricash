import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Zap,
  Settings,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
          <NavLink
            key={item.path}
            to={item.path}
            end
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium"
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

const mockWeeklyData = [
  { day: "Mon", amount: 12500 },
  { day: "Tue", amount: 15800 },
  { day: "Wed", amount: 14200 },
  { day: "Thu", amount: 18900 },
  { day: "Fri", amount: 21300 },
  { day: "Sat", amount: 25600 },
  { day: "Sun", amount: 19400 },
];

const mockAgents = [
  { id: "A001", name: "Rajesh Kumar", transactions: 234, commission: 4680, status: "active" },
  { id: "A002", name: "Priya Sharma", transactions: 189, commission: 3780, status: "active" },
  { id: "A003", name: "Amit Patel", transactions: 156, commission: 3120, status: "inactive" },
  { id: "A004", name: "Sneha Reddy", transactions: 278, commission: 5560, status: "active" },
];

const mockServices = [
  { name: "Electricity", transactions: 1240, revenue: 24800, status: "active" },
  { name: "Water", transactions: 890, revenue: 17800, status: "active" },
  { name: "Mobile Recharge", transactions: 2340, revenue: 46800, status: "active" },
  { name: "Gas", transactions: 456, revenue: 9120, status: "active" },
  { name: "DTH", transactions: 678, revenue: 13560, status: "active" },
];

const PartnerDashboard = () => {
  return (
    <DashboardLayout
      sidebar={<PartnerSidebar />}
      title="Partner Dashboard"
      userRole="Partner"
    >
      <div className="space-y-6">
        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Wallet Balance"
            value="₹1,25,000"
            icon={Wallet}
            variant="default"
          />
          <StatCard
            title="Today's Revenue"
            value="₹19,400"
            change={12}
            trend="up"
            icon={DollarSign}
            variant="accent"
          />
          <StatCard
            title="Total Agents"
            value="42"
            change={5}
            trend="up"
            icon={Users}
            variant="success"
          />
          <StatCard
            title="This Week Transactions"
            value="3,847"
            change={8}
            trend="up"
            icon={TrendingUp}
            variant="default"
          />
        </div>

        {/* Weekly Performance Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bharat Connect */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bharat Connect</CardTitle>
              <Button size="sm">Manage</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockServices.map((service) => (
                    <TableRow key={service.name}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="text-right">{service.transactions}</TableCell>
                      <TableCell className="text-right">₹{service.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Agent Performance */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Agents</CardTitle>
              <Button size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell className="text-right">{agent.transactions}</TableCell>
                      <TableCell className="text-right">₹{agent.commission}</TableCell>
                      <TableCell>
                        <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                          {agent.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <CreditCard className="h-6 w-6 mb-2" />
              <span>Add Money</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Add Agent</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              <span>Request Settlement</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              <span>Configure Services</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PartnerDashboard;
