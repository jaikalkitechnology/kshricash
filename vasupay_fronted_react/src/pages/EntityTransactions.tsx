import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import EntitySidebar from "@/components/EntitySidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { getHierarchyTransactions } from "@/api/entityApi";

const ENTITY_LABELS: Record<string, string> = { white_label: "White Label", agency: "Agency", distributor: "Distributor", partner: "Partner", retailer: "Retailer" };
const ROUTE_BASE: Record<string, string> = { white_label: "/white-label", agency: "/agency", distributor: "/distributor", partner: "/partner", retailer: "/retailer" };

const EntityTransactions = () => {
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
  const [serviceFilter, setServiceFilter] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => { loadData(); }, [page, statusFilter, serviceFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: 20 };
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      if (serviceFilter && serviceFilter !== "all") params.service_type = serviceFilter;
      const data = await getHierarchyTransactions(params);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast({ title: "Error", description: "Failed to load transactions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s: string) => {
    if (s === "success" || s === "completed") return "default";
    if (s === "pending" || s === "processing") return "secondary";
    return "destructive";
  };

  return (
    <DashboardLayout sidebar={<EntitySidebar basePath={basePath} canManageChildren={true} />} title="Transactions" userRole={label}>
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle>Transactions ({total})</CardTitle>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={serviceFilter} onValueChange={(v) => { setServiceFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Service" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="bbps">BBPS</SelectItem>
                    <SelectItem value="aeps">AEPS</SelectItem>
                    <SelectItem value="dmt">DMT</SelectItem>
                    <SelectItem value="recharge">Recharge</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                      <TableHead>User</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">{item.reference_id || item.id}</TableCell>
                        <TableCell>{item.user_name || `User #${item.user_id}`}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{item.service_type || "-"}</Badge></TableCell>
                        <TableCell className="font-medium">₹{Number(item.amount).toLocaleString()}</TableCell>
                        <TableCell><Badge variant={statusColor(item.status)}>{item.status}</Badge></TableCell>
                        <TableCell className="text-sm">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(item); setDetailOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No transactions found</TableCell></TableRow>
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

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Transaction Detail</DialogTitle></DialogHeader>
            {selectedItem && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Reference:</span><p className="font-mono">{selectedItem.reference_id || selectedItem.id}</p></div>
                  <div><span className="text-muted-foreground">User:</span><p>{selectedItem.user_name || `User #${selectedItem.user_id}`}</p></div>
                  <div><span className="text-muted-foreground">Service:</span><p className="capitalize">{selectedItem.service_type || "-"}</p></div>
                  <div><span className="text-muted-foreground">Amount:</span><p className="font-medium">₹{Number(selectedItem.amount).toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground">Status:</span><p><Badge variant={statusColor(selectedItem.status)}>{selectedItem.status}</Badge></p></div>
                  <div><span className="text-muted-foreground">Date:</span><p>{selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString() : "-"}</p></div>
                </div>
                {selectedItem.provider_reference && (
                  <div><span className="text-muted-foreground">Provider Ref:</span><p className="font-mono">{selectedItem.provider_reference}</p></div>
                )}
                {selectedItem.description && (
                  <div><span className="text-muted-foreground">Description:</span><p>{selectedItem.description}</p></div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default EntityTransactions;
