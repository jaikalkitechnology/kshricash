import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/StatCard";
import {
  Wallet, Zap, History, Gift, Smartphone, Lightbulb, Droplet, Tv, Fuel,
  CreditCard, Plus, Receipt,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserShell } from "@/components/shells/UserShell";
import {
  BalanceHero, QuickActionGrid, SectionHead, TransactionList,
  LoadingState, ErrorState, EmptyState, type QuickAction, type TxnItem,
} from "@/components/vasu";
import { useWalletBalances, useWalletTransactions, useTransactionSummary, useCommissionSummary } from "@/hooks/useVasuData";
import { primaryBalance, walletTxnDirection, formatTxnDate } from "@/api/userApi";

const inr = (n: number) => `₹${(n || 0).toLocaleString("en-IN")}`;

const savedBillers = [
  { name: "BESCOM - Electricity", consumerNo: "123456789", amount: 1200 },
  { name: "Airtel - Mobile", consumerNo: "9876543210", amount: 299 },
  { name: "Indane Gas", consumerNo: "567890123", amount: 850 },
];

const UserDashboard = () => {
  const navigate = useNavigate();

  const balances = useWalletBalances();
  const txns = useWalletTransactions(1, 6);
  const summary = useTransactionSummary();
  const commission = useCommissionSummary();

  const balance = primaryBalance(balances.data?.wallets);
  const recent: TxnItem[] = (txns.data?.items || []).map((t) => ({
    id: String(t.id),
    name: t.description || t.type,
    meta: `${t.type} · ${formatTxnDate(t.created_at)}`,
    amount: t.amount,
    direction: walletTxnDirection(t.type),
  }));

  const summaryMap = summary.data?.summary || {};
  const spent = summaryMap["success"]?.total_amount ?? 0;
  const totalTxns = Object.values(summaryMap).reduce((a, s) => a + (s?.count || 0), 0);
  const cashback = commission.data?.total_earned ?? 0;

  const quickActions: QuickAction[] = [
    { label: "Electricity", icon: Lightbulb, tone: "saffron" },
    { label: "Mobile", icon: Smartphone, tone: "teal" },
    { label: "Water", icon: Droplet, tone: "sky" },
    { label: "Gas", icon: Fuel, tone: "gold" },
    { label: "DTH", icon: Tv, tone: "teal" },
    { label: "Credit Card", icon: CreditCard, tone: "saffron" },
    { label: "Recharge", icon: Zap, tone: "gold" },
    { label: "More", icon: Plus, tone: "sky" },
  ].map((a) => ({ ...a, tone: a.tone as QuickAction["tone"], onClick: () => navigate("/user/bills") }));

  return (
    <UserShell title="My Dashboard">
      <div className="mx-auto max-w-5xl space-y-6">
        <BalanceHero
          amount={balance}
          kycVerified
          actions={[
            { label: "Add Money", icon: Plus, primary: true, onClick: () => navigate("/user/wallet") },
            { label: "History", icon: History, onClick: () => navigate("/user/transactions") },
          ]}
        />

        <section>
          <SectionHead title={<>Quick <em className="not-italic text-saffron">pay</em></>} />
          <QuickActionGrid actions={quickActions} />
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title="This Month Spent" value={inr(spent)} icon={Zap} variant="default" />
          <StatCard title="Cashback Earned" value={inr(cashback)} icon={Gift} variant="accent" />
          <StatCard title="Total Transactions" value={String(totalTxns)} icon={History} variant="success" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section>
            <SectionHead title="Saved billers" action={<button onClick={() => navigate("/user/bills")}>ADD NEW</button>} />
            <Card className="divide-y divide-dashed divide-border shadow-sm">
              {savedBillers.map((biller) => (
                <div key={biller.consumerNo} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{biller.name}</p>
                    <p className="font-mono text-xs text-stone">{biller.consumerNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-semibold">₹{biller.amount}</p>
                    <Button size="sm" className="mt-1 h-7" onClick={() => navigate("/user/bills")}>Pay Now</Button>
                  </div>
                </div>
              ))}
            </Card>
          </section>

          <section>
            <SectionHead
              title={<>Recent <em className="not-italic text-saffron">activity</em></>}
              action={<button onClick={() => navigate("/user/transactions")}>VIEW ALL</button>}
            />
            {txns.isLoading ? (
              <LoadingState rows={4} />
            ) : txns.isError ? (
              <ErrorState message={(txns.error as Error)?.message} onRetry={() => txns.refetch()} />
            ) : recent.length === 0 ? (
              <EmptyState title="No activity yet" message="Your recent wallet transactions will appear here." icon={<History className="h-6 w-6" />} />
            ) : (
              <TransactionList items={recent} />
            )}
          </section>
        </div>

        <Card className="overflow-hidden border-0 bg-gradient-to-br from-saffron to-saffron-light text-white shadow-md">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div>
              <h3 className="mb-1 font-display text-xl font-semibold">🎉 Flat ₹50 cashback</h3>
              <p className="text-sm text-white/90">Pay any electricity bill with code <strong>POWER50</strong></p>
              <Button size="sm" variant="secondary" className="mt-3" onClick={() => navigate("/user/bills")}>Pay Now</Button>
            </div>
            <Receipt className="hidden h-16 w-16 opacity-60 sm:block" />
          </CardContent>
        </Card>
      </div>
    </UserShell>
  );
};

export default UserDashboard;
