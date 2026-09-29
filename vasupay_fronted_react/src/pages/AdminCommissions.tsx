import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/StatCard";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, TrendingUp, Wallet, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getCommissions, getCommissionSummary } from "@/api/adminApi";

const AdminCommissions = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userIdFilter, setUserIdFilter] = useState("");

  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => { loadData(); loadSummary(); }, []);
  useEffect(() => { loadData(); }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: 20 };
      if (userIdFilter) params.user_id = parseInt(userIdFilter);
      const data = await getCommissions(params);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load commissions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      setSummaryLoading(true);
      const data = await getCommissionSummary();
      setSummary(data);
    } catch {
      // Summary is optional, don't block page
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSearch = () => { setPage(1); loadData(); };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Commission Management" userRole="Super Admin">
      <div className="space-y-6">
        {/* Summary Stats */}
        {summaryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Commission" value={formatCurrency(summary.total_commission || 0)} icon={DollarSign} variant="default" />
            <StatCard title="Credited" value={formatCurrency(summary.total_credited || 0)} icon={TrendingUp} variant="success" />
            <StatCard title="Pending" value={formatCurrency(summary.total_pending || 0)} icon={Wallet} variant="warning" />
          </div>
        ) : null}

        {/* Filters */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="w-[160px]">
                <Input placeholder="User ID" value={userIdFilter} onChange={(e) => setUserIdFilter(e.target.value)} type="number" />
              </div>
              <Button onClick={handleSearch}><Search className="h-4 w-4 mr-2" />Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Commission Ledger */}
        <Card className="shadow-md">
          <CardHeader><CardTitle>Commission Ledger ({total})</CardTitle></CardHeader>
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
                      <TableHead>Transaction ID</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Credited</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.user_id}</TableCell>
                        <TableCell>{item.transaction_id || "-"}</TableCell>
                        <TableCell className="text-right font-semibold">₹{Number(item.amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={item.is_credited ? "default" : "secondary"}>
                            {item.is_credited ? "Yes" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{new Date(item.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No commission records found</TableCell></TableRow>
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

export default AdminCommissions;
