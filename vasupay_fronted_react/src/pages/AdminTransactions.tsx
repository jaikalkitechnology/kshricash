import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { getTransactions, getTransactionDetail } from "@/api/adminApi";

const SERVICE_TYPES = ["bbps", "aeps", "dmt", "recharge", "wallet_transfer", "payout"];

const AdminTransactions = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { loadData(); }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: 20 };
      if (search) params.search = search;
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      if (serviceFilter && serviceFilter !== "all") params.service_type = serviceFilter;
      const data = await getTransactions(params);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load transactions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { setPage(1); loadData(); };

  const handleViewDetail = async (txnId: number) => {
    try {
      setDetailLoading(true);
      setDetailOpen(true);
      const data = await getTransactionDetail(txnId);
      setDetail(data);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load transaction detail", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive"> = {
      success: "default", completed: "default", pending: "secondary",
      processing: "secondary", failed: "destructive", reversed: "destructive",
    };
    return <Badge variant={map[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Transactions" userRole="Super Admin">
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Input placeholder="Search by reference, order ID..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="reversed">Reversed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Service" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}><Search className="h-4 w-4 mr-2" />Search</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader><CardTitle>Transactions ({total})</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="font-medium">{txn.id}</TableCell>
                        <TableCell className="text-xs font-mono">{txn.reference_id || "-"}</TableCell>
                        <TableCell>{txn.user_id}</TableCell>
                        <TableCell><Badge variant="secondary">{txn.service_type || "-"}</Badge></TableCell>
                        <TableCell className="text-right font-semibold">₹{Number(txn.amount).toLocaleString()}</TableCell>
                        <TableCell>{statusBadge(txn.status)}</TableCell>
                        <TableCell className="text-sm">{new Date(txn.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(txn.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No transactions found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {page} of {pages} ({total} total)</p>
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
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Transaction Detail</DialogTitle></DialogHeader>
            {detailLoading ? (
              <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
            ) : detail ? (
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">ID</Label><p className="font-medium">{detail.id}</p></div>
                <div><Label className="text-muted-foreground">Reference</Label><p className="font-medium font-mono text-sm">{detail.reference_id || "-"}</p></div>
                <div><Label className="text-muted-foreground">User ID</Label><p className="font-medium">{detail.user_id}</p></div>
                <div><Label className="text-muted-foreground">Service Type</Label><Badge variant="secondary">{detail.service_type || "-"}</Badge></div>
                <div><Label className="text-muted-foreground">Amount</Label><p className="font-bold text-lg">₹{Number(detail.amount).toLocaleString()}</p></div>
                <div><Label className="text-muted-foreground">Status</Label>{statusBadge(detail.status)}</div>
                <div><Label className="text-muted-foreground">Provider</Label><p className="font-medium">{detail.provider || "-"}</p></div>
                <div><Label className="text-muted-foreground">Provider Ref</Label><p className="font-medium font-mono text-sm">{detail.provider_reference || "-"}</p></div>
                <div><Label className="text-muted-foreground">Consumer Number</Label><p className="font-medium">{detail.consumer_number || "-"}</p></div>
                <div><Label className="text-muted-foreground">Operator</Label><p className="font-medium">{detail.operator_name || "-"}</p></div>
                <div><Label className="text-muted-foreground">Commission</Label><p className="font-medium">₹{Number(detail.commission_amount || 0).toLocaleString()}</p></div>
                <div><Label className="text-muted-foreground">Created</Label><p className="font-medium">{new Date(detail.created_at).toLocaleString()}</p></div>
                {detail.completed_at && (
                  <div><Label className="text-muted-foreground">Completed</Label><p className="font-medium">{new Date(detail.completed_at).toLocaleString()}</p></div>
                )}
                {detail.failure_reason && (
                  <div className="col-span-2"><Label className="text-muted-foreground">Failure Reason</Label><p className="font-medium text-destructive">{detail.failure_reason}</p></div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminTransactions;
