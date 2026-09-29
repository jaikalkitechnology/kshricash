import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getSettlements, approveSettlement, rejectSettlement, completeSettlement } from "@/api/adminApi";

const AdminSettlements = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "complete">("approve");
  const [actionId, setActionId] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadData(); }, [page, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: 20 };
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      const data = await getSettlements(params);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load settlements", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openAction = (id: number, type: "approve" | "reject" | "complete") => {
    setActionId(id);
    setActionType(type);
    setRemarks("");
    setBankRef("");
    setActionOpen(true);
  };

  const handleAction = async () => {
    try {
      setActionLoading(true);
      const payload: any = {};
      if (remarks) payload.remarks = remarks;
      if (bankRef) payload.bank_reference = bankRef;

      if (actionType === "approve") await approveSettlement(actionId, payload);
      else if (actionType === "reject") await rejectSettlement(actionId, payload);
      else await completeSettlement(actionId, payload);

      toast({ title: "Success", description: `Settlement ${actionType}d successfully` });
      setActionOpen(false);
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.detail || `Failed to ${actionType} settlement`, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default", approved: "default", pending: "secondary",
      processing: "secondary", rejected: "destructive", failed: "destructive",
    };
    return <Badge variant={map[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Settlement Management" userRole="Super Admin">
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
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                      <TableHead>User ID</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Bank Account</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.user_id}</TableCell>
                        <TableCell className="text-right font-semibold">₹{Number(item.amount).toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{item.bank_account_number || "-"}</TableCell>
                        <TableCell>{statusBadge(item.status)}</TableCell>
                        <TableCell className="text-sm">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {item.status === "pending" && (
                              <>
                                <Button size="sm" variant="default" onClick={() => openAction(item.id, "approve")}>
                                  <CheckCircle className="h-4 w-4 mr-1" />Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => openAction(item.id, "reject")}>
                                  <XCircle className="h-4 w-4 mr-1" />Reject
                                </Button>
                              </>
                            )}
                            {item.status === "approved" && (
                              <Button size="sm" variant="default" onClick={() => openAction(item.id, "complete")}>
                                <ArrowRight className="h-4 w-4 mr-1" />Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No settlements found</TableCell></TableRow>
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

        <Dialog open={actionOpen} onOpenChange={setActionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="capitalize">{actionType} Settlement #{actionId}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {(actionType === "approve" || actionType === "complete") && (
                <div>
                  <Label>Bank Reference (optional)</Label>
                  <Input value={bankRef} onChange={(e) => setBankRef(e.target.value)} placeholder="UTR / NEFT reference..." />
                </div>
              )}
              <div>
                <Label>Remarks (optional)</Label>
                <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter remarks..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionOpen(false)}>Cancel</Button>
              <Button variant={actionType === "reject" ? "destructive" : "default"} onClick={handleAction} disabled={actionLoading}>
                {actionLoading ? "Processing..." : actionType.charAt(0).toUpperCase() + actionType.slice(1)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettlements;
