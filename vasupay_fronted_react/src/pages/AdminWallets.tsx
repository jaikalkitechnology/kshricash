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
import { Search, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { getWallets, adjustWallet } from "@/api/adminApi";

const AdminWallets = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("");

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustId, setAdjustId] = useState(0);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustDesc, setAdjustDesc] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

  useEffect(() => { loadData(); }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: 20 };
      if (userIdFilter) params.user_id = parseInt(userIdFilter);
      if (purposeFilter && purposeFilter !== "all") params.purpose = purposeFilter;
      const data = await getWallets(params);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load wallets", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { setPage(1); loadData(); };

  const openAdjust = (walletId: number) => {
    setAdjustId(walletId);
    setAdjustAmount("");
    setAdjustDesc("");
    setAdjustOpen(true);
  };

  const handleAdjust = async () => {
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount === 0) {
      toast({ title: "Error", description: "Enter a valid non-zero amount", variant: "destructive" });
      return;
    }
    if (!adjustDesc.trim()) {
      toast({ title: "Error", description: "Description is required", variant: "destructive" });
      return;
    }
    try {
      setAdjustLoading(true);
      await adjustWallet(adjustId, amount, adjustDesc);
      toast({ title: "Success", description: `Wallet adjusted by ₹${amount}` });
      setAdjustOpen(false);
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.detail || "Failed to adjust wallet", variant: "destructive" });
    } finally {
      setAdjustLoading(false);
    }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Wallet Management" userRole="Super Admin">
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="w-[160px]">
                <Input placeholder="User ID" value={userIdFilter} onChange={(e) => setUserIdFilter(e.target.value)} type="number" />
              </div>
              <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Wallet Purpose" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  <SelectItem value="main">Main</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                  <SelectItem value="security_deposit">Security Deposit</SelectItem>
                  <SelectItem value="cashback">Cashback</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}><Search className="h-4 w-4 mr-2" />Search</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader><CardTitle>Wallets ({total})</CardTitle></CardHeader>
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
                      <TableHead>Purpose</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((wallet) => (
                      <TableRow key={wallet.id}>
                        <TableCell className="font-medium">{wallet.id}</TableCell>
                        <TableCell>{wallet.user_id}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{wallet.purpose}</Badge></TableCell>
                        <TableCell className="text-right font-semibold">₹{Number(wallet.balance).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={wallet.is_active ? "default" : "destructive"}>
                            {wallet.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{new Date(wallet.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => openAdjust(wallet.id)}>
                            <DollarSign className="h-4 w-4 mr-1" />Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No wallets found</TableCell></TableRow>
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

        <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Adjust Wallet #{adjustId}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Amount (positive to credit, negative to debit)</Label>
                <Input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="e.g. 500 or -200" />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea value={adjustDesc} onChange={(e) => setAdjustDesc(e.target.value)} placeholder="Reason for adjustment..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAdjustOpen(false)}>Cancel</Button>
              <Button onClick={handleAdjust} disabled={adjustLoading}>{adjustLoading ? "Processing..." : "Adjust"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminWallets;
