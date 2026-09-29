import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import EntitySidebar from "@/components/EntitySidebar";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Wallet, Activity, DollarSign, UserCheck, MessageSquare, TrendingUp, AlertCircle, ArrowDownToLine, Banknote } from "lucide-react";
import { getEntityDashboard } from "@/api/entityApi";
import { useAuth } from "@/contexts/AuthContext";
import { BalanceHero } from "@/components/vasu";

const ENTITY_LABELS: Record<string, string> = {
  white_label: "White Label",
  agency: "Agency",
  distributor: "Distributor",
  partner: "Partner",
  retailer: "Retailer",
};

const ROUTE_BASE: Record<string, string> = {
  white_label: "/white-label",
  agency: "/agency",
  distributor: "/distributor",
  partner: "/partner",
  retailer: "/retailer",
};

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
};

const EntityDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const entityType = user?.entity_type || "retailer";
  const label = ENTITY_LABELS[entityType] || entityType;
  const basePath = ROUTE_BASE[entityType] || "/user";
  const canManage = (stats?.creatable_types?.length || 0) > 0;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getEntityDashboard();
      setStats(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<EntitySidebar basePath={basePath} canManageChildren={true} />} title={`${label} Dashboard`} userRole={label}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout sidebar={<EntitySidebar basePath={basePath} canManageChildren={true} />} title={`${label} Dashboard`} userRole={label}>
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-lg font-medium text-destructive">{error}</p>
          <Button onClick={loadStats} className="mt-4">Retry</Button>
        </Card>
      </DashboardLayout>
    );
  }

  const s = stats!;

  return (
    <DashboardLayout sidebar={<EntitySidebar basePath={basePath} canManageChildren={canManage} />} title={`${label} Dashboard`} userRole={label}>
      <div className="space-y-6">
        {/* Wallet hero */}
        <BalanceHero
          label={`${label.toUpperCase()} WALLET`}
          amount={Number(s.wallet_balance) || 0}
          variant="gradient"
          actions={[
            { label: "Load Wallet", icon: ArrowDownToLine, primary: true, onClick: () => navigate(`${basePath}/wallet`) },
            { label: "Settlements", icon: Banknote, onClick: () => navigate(`${basePath}/settlements`) },
            { label: "Transactions", icon: Activity, onClick: () => navigate(`${basePath}/transactions`) },
          ]}
        />

        {/* Stats Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Wallet Balance" value={formatCurrency(s.wallet_balance)} icon={Wallet} variant="accent" />
          <StatCard title="Total Transactions" value={s.total_transactions.toLocaleString()} icon={Activity} variant="default" />
          <StatCard title="Transaction Volume" value={formatCurrency(s.total_transaction_amount)} icon={TrendingUp} variant="success" />
          <StatCard title="Commission Earned" value={formatCurrency(s.total_commission_earned)} icon={DollarSign} variant="accent" />
        </div>

        {/* Stats Row 2 (for entities that can manage children) */}
        {canManage && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Entities" value={s.total_children.toLocaleString()} icon={Users} variant="default" />
            <StatCard title="Active Entities" value={s.active_children.toLocaleString()} icon={UserCheck} variant="success" />
            <StatCard title="Pending KYC" value={s.pending_kyc_approvals.toLocaleString()} icon={UserCheck} variant="warning" />
            <StatCard title="Open Tickets" value={s.open_tickets.toLocaleString()} icon={MessageSquare} variant="warning" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Children by Type */}
          {canManage && Object.keys(s.children_by_type).length > 0 && (
            <Card className="shadow-md">
              <CardHeader><CardTitle>Entities by Type</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(s.children_by_type).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Creatable Types */}
          {canManage && s.creatable_types?.length > 0 && (
            <Card className="shadow-md">
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {s.creatable_types.map((type: string) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate(`${basePath}/entities?create=${type}`)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Create {type.replace('_', ' ')}
                  </Button>
                ))}
                {s.pending_kyc_approvals > 0 && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate(`${basePath}/kyc`)}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Review KYC ({s.pending_kyc_approvals} pending)
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EntityDashboard;
