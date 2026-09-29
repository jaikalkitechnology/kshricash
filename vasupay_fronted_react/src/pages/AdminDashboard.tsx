import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import AdminSidebar from "@/components/AdminSidebar";
import { StatCard } from "@/components/StatCard";
import {
  Users, Wallet, Activity, DollarSign, UserCheck, AlertCircle,
  Shield, Banknote, MessageSquare, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats } from "@/api/adminApi";
import { useNavigate } from "react-router-dom";

interface DashboardData {
  total_users: number;
  active_users: number;
  inactive_users: number;
  suspended_users: number;
  users_by_entity: Record<string, number>;
  total_wallet_balance: number;
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  total_transaction_amount: number;
  pending_kyc: number;
  verified_kyc: number;
  rejected_kyc: number;
  pending_settlements: number;
  pending_settlement_amount: number;
  open_tickets: number;
  total_commission_paid: number;
}

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} title="Admin Dashboard" userRole="Super Admin">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} title="Admin Dashboard" userRole="Super Admin">
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
    <DashboardLayout sidebar={<AdminSidebar />} title="Admin Dashboard" userRole="Super Admin">
      <div className="space-y-6">
        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={s.total_users.toLocaleString()} icon={Users} variant="default" />
          <StatCard title="Active Users" value={s.active_users.toLocaleString()} icon={UserCheck} variant="success" />
          <StatCard title="Total Wallet Balance" value={formatCurrency(s.total_wallet_balance)} icon={Wallet} variant="accent" />
          <StatCard title="Total Transactions" value={s.total_transactions.toLocaleString()} icon={Activity} variant="default" />
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Transaction Volume" value={formatCurrency(s.total_transaction_amount)} icon={TrendingUp} variant="accent" />
          <StatCard title="Commissions Paid" value={formatCurrency(s.total_commission_paid)} icon={DollarSign} variant="success" />
          <StatCard title="Pending Settlements" value={`${s.pending_settlements} (${formatCurrency(s.pending_settlement_amount)})`} icon={Banknote} variant="warning" />
          <StatCard title="Open Tickets" value={s.open_tickets.toLocaleString()} icon={MessageSquare} variant="warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users by Entity */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Users by Entity Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(s.users_by_entity).map(([entity, count]) => (
                  <div key={entity} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium capitalize">{entity}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
                {Object.keys(s.users_by_entity).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No users yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* KYC & Transaction Summary */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>KYC & Transaction Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Pending KYC</span>
                  <Badge variant="secondary">{s.pending_kyc}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Verified KYC</span>
                  <Badge variant="default">{s.verified_kyc}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Rejected KYC</span>
                  <Badge variant="destructive">{s.rejected_kyc}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Successful Transactions</span>
                  <Badge variant="default">{s.successful_transactions}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Failed Transactions</span>
                  <Badge variant="destructive">{s.failed_transactions}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20" onClick={() => navigate("/admin/kyc")}>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2" />
                <span>Review KYC ({s.pending_kyc})</span>
              </div>
            </Button>
            <Button variant="outline" className="h-20" onClick={() => navigate("/admin/settlements")}>
              <div className="text-center">
                <Banknote className="h-6 w-6 mx-auto mb-2" />
                <span>Settlements ({s.pending_settlements})</span>
              </div>
            </Button>
            <Button variant="outline" className="h-20" onClick={() => navigate("/admin/tickets")}>
              <div className="text-center">
                <MessageSquare className="h-6 w-6 mx-auto mb-2" />
                <span>Tickets ({s.open_tickets})</span>
              </div>
            </Button>
            <Button variant="outline" className="h-20" onClick={() => navigate("/admin/users")}>
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto mb-2" />
                <span>Manage Users</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
