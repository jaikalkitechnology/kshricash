import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import EntitySidebar from "@/components/EntitySidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, DollarSign } from "lucide-react";
import { getHierarchyCommissions } from "@/api/entityApi";

const ENTITY_LABELS: Record<string, string> = { white_label: "White Label", agency: "Agency", distributor: "Distributor", partner: "Partner", retailer: "Retailer" };
const ROUTE_BASE: Record<string, string> = { white_label: "/white-label", agency: "/agency", distributor: "/distributor", partner: "/partner", retailer: "/retailer" };

const EntityCommissions = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const entityType = user?.entity_type || "partner";
  const label = ENTITY_LABELS[entityType] || entityType;
  const basePath = ROUTE_BASE[entityType] || "/user";

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getHierarchyCommissions({ page, per_page: 20 });
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast({ title: "Error", description: "Failed to load commissions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const totalEarned = items.reduce((s, c) => s + Number(c.amount || 0), 0);

  return (
    <DashboardLayout sidebar={<EntitySidebar basePath={basePath} canManageChildren={true} />} title="Commissions" userRole={label}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-100"><DollarSign className="h-5 w-5 text-green-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Page Earnings</p>
                  <p className="text-2xl font-bold">₹{totalEarned.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-100"><DollarSign className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold">{total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader><CardTitle>Commission Ledger</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell className="font-mono text-sm">{item.transaction_id || "-"}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{item.service_type || "-"}</Badge></TableCell>
                        <TableCell className="font-medium text-green-600">₹{Number(item.amount || 0).toLocaleString()}</TableCell>
                        <TableCell>{item.commission_rate ? `${item.commission_rate}%` : "-"}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === "credited" || item.status === "paid" ? "default" : "secondary"}>
                            {item.status || "pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}</TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No commission records found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {page} of {pages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EntityCommissions;
