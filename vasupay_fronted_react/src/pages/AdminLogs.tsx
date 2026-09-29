import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getAuditLogs } from "@/api/adminApi";

const AdminLogs = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");

  useEffect(() => { loadData(); }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: 30 };
      if (userIdFilter) params.user_id = parseInt(userIdFilter);
      if (actionFilter && actionFilter !== "all") params.action = actionFilter;
      if (resourceFilter && resourceFilter !== "all") params.resource_type = resourceFilter;
      const data = await getAuditLogs(params);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load audit logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { setPage(1); loadData(); };

  const actionBadge = (action: string) => {
    const colors: Record<string, "default" | "secondary" | "destructive"> = {
      create: "default", update: "secondary", delete: "destructive",
      login: "default", logout: "secondary", approve: "default",
      reject: "destructive",
    };
    return <Badge variant={colors[action] || "secondary"}>{action}</Badge>;
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Audit Logs" userRole="Super Admin">
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="w-[140px]">
                <Input placeholder="User ID" value={userIdFilter} onChange={(e) => setUserIdFilter(e.target.value)} type="number" />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Action" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Resource" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="transaction">Transaction</SelectItem>
                  <SelectItem value="kyc">KYC</SelectItem>
                  <SelectItem value="settlement">Settlement</SelectItem>
                  <SelectItem value="ticket">Ticket</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}><Search className="h-4 w-4 mr-2" />Search</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader><CardTitle>Audit Logs ({total})</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Resource ID</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.id}</TableCell>
                        <TableCell>{log.user_id || "-"}</TableCell>
                        <TableCell>{actionBadge(log.action)}</TableCell>
                        <TableCell><Badge variant="secondary">{log.resource_type || "-"}</Badge></TableCell>
                        <TableCell>{log.resource_id || "-"}</TableCell>
                        <TableCell className="text-sm font-mono">{log.ip_address || "-"}</TableCell>
                        <TableCell className="text-sm">{new Date(log.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No audit logs found</TableCell></TableRow>
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
      </div>
    </DashboardLayout>
  );
};

export default AdminLogs;
