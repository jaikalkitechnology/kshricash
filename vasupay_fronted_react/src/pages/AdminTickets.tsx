import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Eye, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { getTickets, getTicketDetail, replyToTicket, updateTicketStatus } from "@/api/adminApi";

const AdminTickets = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  // Status update
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusId, setStatusId] = useState(0);
  const [newStatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => { loadData(); }, [page, statusFilter, priorityFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: 20 };
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      if (priorityFilter && priorityFilter !== "all") params.priority = priorityFilter;
      const data = await getTickets(params);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load tickets", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (ticketId: number) => {
    try {
      setDetailLoading(true);
      setDetailOpen(true);
      setReplyText("");
      const data = await getTicketDetail(ticketId);
      setDetail(data);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load ticket detail", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      setReplyLoading(true);
      await replyToTicket(detail.id, replyText);
      toast({ title: "Success", description: "Reply sent" });
      setReplyText("");
      // Reload detail to show new reply
      const data = await getTicketDetail(detail.id);
      setDetail(data);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to send reply", variant: "destructive" });
    } finally {
      setReplyLoading(false);
    }
  };

  const openStatusUpdate = (id: number, currentStatus: string, currentPriority: string) => {
    setStatusId(id);
    setNewStatus(currentStatus);
    setNewPriority(currentPriority || "medium");
    setStatusOpen(true);
  };

  const handleStatusUpdate = async () => {
    try {
      setStatusLoading(true);
      const payload: any = { status: newStatus };
      if (newPriority) payload.priority = newPriority;
      await updateTicketStatus(statusId, payload);
      toast({ title: "Success", description: "Ticket updated" });
      setStatusOpen(false);
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to update ticket", variant: "destructive" });
    } finally {
      setStatusLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive"> = {
      open: "secondary", in_progress: "default", resolved: "default",
      closed: "destructive",
    };
    return <Badge variant={map[status] || "secondary"}>{status}</Badge>;
  };

  const priorityBadge = (priority: string) => {
    const map: Record<string, "default" | "secondary" | "destructive"> = {
      low: "secondary", medium: "default", high: "destructive",
      critical: "destructive",
    };
    return <Badge variant={map[priority] || "secondary"}>{priority}</Badge>;
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Support Tickets" userRole="Super Admin">
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>Tickets ({total})</CardTitle>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
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
                      <TableHead>Subject</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{ticket.subject}</TableCell>
                        <TableCell>{ticket.user_id}</TableCell>
                        <TableCell>{priorityBadge(ticket.priority || "medium")}</TableCell>
                        <TableCell>{statusBadge(ticket.status)}</TableCell>
                        <TableCell className="text-sm">{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetail(ticket.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openStatusUpdate(ticket.id, ticket.status, ticket.priority)}>
                              Update
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No tickets found</TableCell></TableRow>
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

        {/* Ticket Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Ticket Detail</DialogTitle></DialogHeader>
            {detailLoading ? (
              <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
            ) : detail ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Subject</Label><p className="font-medium">{detail.subject}</p></div>
                  <div><Label className="text-muted-foreground">Status</Label>{statusBadge(detail.status)}</div>
                  <div><Label className="text-muted-foreground">User ID</Label><p className="font-medium">{detail.user_id}</p></div>
                  <div><Label className="text-muted-foreground">Priority</Label>{priorityBadge(detail.priority || "medium")}</div>
                  <div><Label className="text-muted-foreground">Category</Label><p className="font-medium">{detail.category || "-"}</p></div>
                  <div><Label className="text-muted-foreground">Created</Label><p className="font-medium">{new Date(detail.created_at).toLocaleString()}</p></div>
                </div>

                {detail.description && (
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="mt-1 p-3 bg-muted/50 rounded-lg whitespace-pre-wrap">{detail.description}</p>
                  </div>
                )}

                {/* Replies */}
                {detail.replies && detail.replies.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Conversation</Label>
                    <div className="space-y-3 mt-2">
                      {detail.replies.map((reply: any) => (
                        <div key={reply.id} className={`p-3 rounded-lg ${reply.is_admin_reply ? "bg-primary/10 ml-8" : "bg-muted/50 mr-8"}`}>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{reply.is_admin_reply ? "Admin" : `User #${reply.user_id}`}</span>
                            <span>{new Date(reply.created_at).toLocaleString()}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                <div className="space-y-2 border-t pt-4">
                  <Label>Reply</Label>
                  <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply..." rows={3} />
                  <Button onClick={handleReply} disabled={replyLoading || !replyText.trim()}>
                    <Send className="h-4 w-4 mr-2" />{replyLoading ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Update Ticket #{statusId}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusOpen(false)}>Cancel</Button>
              <Button onClick={handleStatusUpdate} disabled={statusLoading}>{statusLoading ? "Updating..." : "Update"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminTickets;
