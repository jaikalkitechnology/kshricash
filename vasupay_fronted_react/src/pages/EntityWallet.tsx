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
import { Wallet, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getEntityProfile } from "@/api/entityApi";
import api from "@/api/api";

const ENTITY_LABELS: Record<string, string> = { white_label: "White Label", agency: "Agency", distributor: "Distributor", partner: "Partner", retailer: "Retailer" };
const ROUTE_BASE: Record<string, string> = { white_label: "/white-label", agency: "/agency", distributor: "/distributor", partner: "/partner", retailer: "/retailer" };

const EntityWallet = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const entityType = user?.entity_type || "partner";
  const label = ENTITY_LABELS[entityType] || entityType;
  const basePath = ROUTE_BASE[entityType] || "/user";

  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txTotal, setTxTotal] = useState(0);
  const [txPages, setTxPages] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => { loadProfile(); }, []);
  useEffect(() => { loadWalletTxns(); }, [txPage]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getEntityProfile();
      setProfile(data);
    } catch {
      toast({ title: "Error", description: "Failed to load wallet info", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadWalletTxns = async () => {
    try {
      setTxLoading(true);
      const { data } = await api.get("/wallets/transactions", { params: { page: txPage, per_page: 20 } });
      setTransactions(data.items || []);
      setTxTotal(data.total || 0);
      setTxPages(data.pages || 1);
    } catch {
      // Wallet transactions endpoint may not exist yet - graceful fallback
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  const mainWallet = profile?.wallets?.find((w: any) => w.wallet_type === "main");
  const commissionWallet = profile?.wallets?.find((w: any) => w.wallet_type === "commission");

  return (
    <DashboardLayout sidebar={<EntitySidebar basePath={basePath} canManageChildren={true} />} title="Wallet" userRole={label}>
      <div className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-blue-500/10"><Wallet className="h-8 w-8 text-blue-600" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Main Wallet</p>
                    <p className="text-3xl font-bold">₹{mainWallet ? Number(mainWallet.balance).toLocaleString() : "0"}</p>
                    {mainWallet?.is_locked && <Badge variant="destructive" className="mt-1">Locked</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-green-500/10"><Wallet className="h-8 w-8 text-green-600" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Commission Wallet</p>
                    <p className="text-3xl font-bold">₹{commissionWallet ? Number(commissionWallet.balance).toLocaleString() : "0"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="shadow-md">
          <CardHeader><CardTitle>Wallet Transactions ({txTotal})</CardTitle></CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance After</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">{tx.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {tx.transaction_type === "credit" ? (
                              <ArrowDownRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-red-500" />
                            )}
                            <span className="capitalize">{tx.transaction_type}</span>
                          </div>
                        </TableCell>
                        <TableCell className={tx.transaction_type === "credit" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                          {tx.transaction_type === "credit" ? "+" : "-"}₹{Number(tx.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>₹{Number(tx.balance_after || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{tx.description || "-"}</TableCell>
                        <TableCell className="text-sm">{tx.created_at ? new Date(tx.created_at).toLocaleDateString() : "-"}</TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No wallet transactions found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
                {txTotal > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">Page {txPage} of {txPages}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={txPage <= 1} onClick={() => setTxPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" disabled={txPage >= txPages} onClick={() => setTxPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EntityWallet;
