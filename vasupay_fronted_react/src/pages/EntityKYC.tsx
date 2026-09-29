import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import EntitySidebar from "@/components/EntitySidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { getHierarchyKYC, approveChildKYC, rejectChildKYC } from "@/api/entityApi";

const ENTITY_LABELS: Record<string, string> = { white_label: "White Label", agency: "Agency", distributor: "Distributor", partner: "Partner", retailer: "Retailer" };
const ROUTE_BASE: Record<string, string> = { white_label: "/white-label", agency: "/agency", distributor: "/distributor", partner: "/partner", retailer: "/retailer" };

const EntityKYC = () => {
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

  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [actionId, setActionId] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadData(); }, [page, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: 20 };
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      const data = await getHierarchyKYC(params);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast({ title: "Error", description: "Failed to load KYC submissions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openAction = (id: number, type: "approve" | "reject") => {
    setActionId(id); setActionType(type); setRemarks(""); setActionOpen(true);
  };

  const handleAction = async () => {
    try {
      setActionLoading(true);
      if (actionType === "approve") await approveChildKYC(actionId, remarks || undefined);
      else await rejectChildKYC(actionId, remarks || undefined);
      toast({ title: "Success", description: `KYC ${actionType}d successfully` });
      setActionOpen(false);
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.detail || `Failed to ${actionType} KYC`, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout sidebar={<EntitySidebar basePath={basePath} canManageChildren={true} />} title="KYC Approvals" userRole={label}>
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>KYC Submissions ({total})</CardTitle>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
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
                      <TableHead>User</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Aadhaar</TableHead>
                      <TableHead>PAN</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.user_name} ({item.user_phone})</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{item.entity_type?.replace('_', ' ') || "-"}</Badge></TableCell>
                        <TableCell>{item.aadhaar_number || "-"}</TableCell>
                        <TableCell>{item.pan_number || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === "verified" ? "default" : item.status === "pending" ? "secondary" : "destructive"}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>
                          {item.status === "pending" && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="default" onClick={() => openAction(item.id, "approve")}><CheckCircle className="h-4 w-4 mr-1" />Approve</Button>
                              <Button size="sm" variant="destructive" onClick={() => openAction(item.id, "reject")}><XCircle className="h-4 w-4 mr-1" />Reject</Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No KYC submissions found</TableCell></TableRow>
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
            <DialogHeader><DialogTitle>{actionType === "approve" ? "Approve" : "Reject"} KYC #{actionId}</DialogTitle></DialogHeader>
            <div><Label>Remarks (optional)</Label><Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter remarks..." /></div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionOpen(false)}>Cancel</Button>
              <Button variant={actionType === "approve" ? "default" : "destructive"} onClick={handleAction} disabled={actionLoading}>
                {actionLoading ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default EntityKYC;
