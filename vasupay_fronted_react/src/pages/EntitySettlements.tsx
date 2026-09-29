import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import EntitySidebar from "@/components/EntitySidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/api/api";

const ENTITY_LABELS: Record<string, string> = { white_label: "White Label", agency: "Agency", distributor: "Distributor", partner: "Partner", retailer: "Retailer" };
const ROUTE_BASE: Record<string, string> = { white_label: "/white-label", agency: "/agency", distributor: "/distributor", partner: "/partner", retailer: "/retailer" };

const EntitySettlements = () => {
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
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => { loadData(); }, [page, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: 20 };
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      const { data } = await api.get("/settlements", { params });
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      toast({ title: "Error", description: "Failed to load settlements", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s: string) => {
    if (s === "completed" || s === "paid") return "default";
    if (s === "pending" || s === "processing") return "secondary";
    return "destructive";
  };

  return (
    <DashboardLayout sidebar={<EntitySidebar basePath={basePath} canManageChildren={true} />} title="Settlements" userRole={label}>
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Settlements ({total})</CardTitle>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Bank Account</TableHead>
                      <TableHead>UTR</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell className="font-medium">₹{Number(item.amount).toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{item.bank_account_number ? `****${item.bank_account_number.slice(-4)}` : "-"}</TableCell>
                        <TableCell className="font-mono text-sm">{item.utr_number || "-"}</TableCell>
                        <TableCell><Badge variant={statusColor(item.status)}>{item.status}</Badge></TableCell>
                        <TableCell className="text-sm">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}</TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No settlements found</TableCell></TableRow>
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

export default EntitySettlements;
