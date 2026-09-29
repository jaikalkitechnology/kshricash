import { AgentShell } from "@/components/shells/AgentShell";
import { LayoutDashboard, Users, Receipt, Settings, FileText, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const AgentCustomers = () => {
  const customers = [
    { id: "1", name: "Rajesh Kumar", phone: "+91 98765 43210", lastTxn: "Today", totalTxn: 45, status: "active" },
    { id: "2", name: "Priya Sharma", phone: "+91 98765 43211", lastTxn: "Yesterday", totalTxn: 32, status: "active" },
    { id: "3", name: "Amit Patel", phone: "+91 98765 43212", lastTxn: "2 days ago", totalTxn: 28, status: "active" },
    { id: "4", name: "Sunita Verma", phone: "+91 98765 43213", lastTxn: "1 week ago", totalTxn: 15, status: "inactive" },
  ];

  return (
    <AgentShell title="Customers">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Customer List</h2>
            <p className="text-muted-foreground text-sm mt-1">Track and manage your customers</p>
          </div>
          <Input className="w-64" placeholder="Search customers..." />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Last Transaction</TableHead>
              <TableHead>Total Transactions</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell className="text-muted-foreground">{customer.lastTxn}</TableCell>
                <TableCell>{customer.totalTxn}</TableCell>
                <TableCell>
                  <Badge variant={customer.status === "active" ? "outline" : "secondary"}>
                    {customer.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AgentShell>
  );
};

export default AgentCustomers;
