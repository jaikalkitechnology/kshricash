import { useNavigate } from "react-router-dom";
import { AgentShell } from "@/components/shells/AgentShell";
import { StatCard } from "@/components/StatCard";
import {
  Users, Receipt, CreditCard, Lightbulb, Smartphone, Droplet, Tv, Fuel, Wifi, Plus, DollarSign, History,
} from "lucide-react";
import {
  BalanceHero, QuickActionGrid, SectionHead, TransactionList,
  LoadingState, ErrorState, EmptyState, type QuickAction, type TxnItem,
} from "@/components/vasu";
import { useWalletBalances, useWalletTransactions, useTransactionSummary, useCommissionSummary } from "@/hooks/useVasuData";
import { primaryBalance, walletTxnDirection, formatTxnDate } from "@/api/userApi";

const inr = (n: number) => `₹${(n || 0).toLocaleString("en-IN")}`;

const AgentDashboard = () => {
  const navigate = useNavigate();

  const balances = useWalletBalances();
  const txns = useWalletTransactions(1, 6);
  const summary = useTransactionSummary();
  const commission = useCommissionSummary();

  const balance = primaryBalance(balances.data?.wallets);
  const summaryMap = summary.data?.summary || {};
  const volume = Object.values(summaryMap).reduce((a, s) => a + (s?.total_amount || 0), 0);
  const totalTxns = Object.values(summaryMap).reduce((a, s) => a + (s?.count || 0), 0);
  const commissionEarned = commission.data?.total_earned ?? 0;

  const recent: TxnItem[] = (txns.data?.items || []).map((t) => ({
    id: String(t.id),
    name: t.description || t.type,
    meta: `${t.type} · ${formatTxnDate(t.created_at)}`,
    amount: t.amount,
    direction: walletTxnDirection(t.type),
  }));

  const quickActions: QuickAction[] = [
    { label: "Electricity", icon: Lightbulb, tone: "saffron" },
    { label: "Mobile", icon: Smartphone, tone: "teal" },
    { label: "Water", icon: Droplet, tone: "sky" },
    { label: "Gas", icon: Fuel, tone: "gold" },
    { label: "DTH", icon: Tv, tone: "teal" },
    { label: "Broadband", icon: Wifi, tone: "sky" },
    { label: "Recharge", icon: Receipt, tone: "saffron" },
    { label: "More", icon: Plus, tone: "gold" },
  ].map((a) => ({ ...a, tone: a.tone as QuickAction["tone"], onClick: () => navigate("/agent/bbps") }));

  return (
    <AgentShell title="Agent Dashboard">
      <div className="mx-auto max-w-5xl space-y-6">
        <BalanceHero
          label="AGENT FLOAT BALANCE"
          amount={balance}
          variant="gradient"
          actions={[
            { label: "Collect", icon: Plus, primary: true, onClick: () => navigate("/agent/bbps") },
            { label: "Customers", icon: Users, onClick: () => navigate("/agent/customers") },
            { label: "Reports", icon: Receipt, onClick: () => navigate("/agent/reports") },
          ]}
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard title="Transaction Volume" value={inr(volume)} icon={CreditCard} variant="default" />
          <StatCard title="Commission Earned" value={inr(commissionEarned)} icon={DollarSign} variant="accent" />
          <StatCard title="Transactions" value={String(totalTxns)} icon={CreditCard} variant="success" />
          <StatCard title="Float Balance" value={inr(balance)} icon={Receipt} variant="warning" />
        </div>

        <section>
          <SectionHead title={<>Collect <em className="not-italic text-saffron">payment</em></>} />
          <QuickActionGrid actions={quickActions} />
        </section>

        <section>
          <SectionHead title="Recent transactions" action={<button onClick={() => navigate("/agent/transactions")}>VIEW ALL</button>} />
          {txns.isLoading ? (
            <LoadingState rows={4} />
          ) : txns.isError ? (
            <ErrorState message={(txns.error as Error)?.message} onRetry={() => txns.refetch()} />
          ) : recent.length === 0 ? (
            <EmptyState title="No transactions yet" message="Collected payments will appear here." icon={<History className="h-6 w-6" />} />
          ) : (
            <TransactionList items={recent} />
          )}
        </section>
      </div>
    </AgentShell>
  );
};

export default AgentDashboard;
