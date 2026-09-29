import { UserShell } from "@/components/shells/UserShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, History } from "lucide-react";
import {
  BalanceHero, SectionHead, TransactionList, LoadingState, ErrorState, EmptyState, type TxnItem,
} from "@/components/vasu";
import { useWalletBalances, useWalletTransactions, useTransactionSummary, useCommissionSummary } from "@/hooks/useVasuData";
import { primaryBalance, walletTxnDirection, formatTxnDate } from "@/api/userApi";

const inr = (n: number) => `₹${(n || 0).toLocaleString("en-IN")}`;

const UserWallet = () => {
  const balances = useWalletBalances();
  const txns = useWalletTransactions(1, 12);
  const summary = useTransactionSummary();
  const commission = useCommissionSummary();

  const balance = primaryBalance(balances.data?.wallets);
  const spent = summary.data?.summary?.["success"]?.total_amount ?? 0;
  const cashback = commission.data?.total_earned ?? 0;

  const history: TxnItem[] = (txns.data?.items || []).map((t) => ({
    id: String(t.id),
    name: t.description || t.type,
    meta: `${t.type} · ${formatTxnDate(t.created_at)}`,
    amount: t.amount,
    direction: walletTxnDirection(t.type),
  }));

  return (
    <UserShell title="My Wallet">
      <div className="mx-auto max-w-4xl space-y-6">
        <BalanceHero
          label="VASU WALLET"
          amount={balance}
          variant="gradient"
          kycVerified
          actions={[
            { label: "Add Money", icon: Plus, primary: true },
            { label: "History", icon: History },
          ]}
        >
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/15 pt-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-vasu-mint">This Month Spent</p>
              <p className="font-display text-xl font-semibold">{inr(spent)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-vasu-mint">Cashback Earned</p>
              <p className="font-display text-xl font-semibold">{inr(cashback)}</p>
            </div>
          </div>
        </BalanceHero>

        <Card className="shadow-sm">
          <CardHeader><CardTitle className="font-display">Add Money</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="Enter amount" />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline">UPI</Button>
                <Button variant="outline">Card</Button>
                <Button variant="outline">Net Banking</Button>
              </div>
            </div>
            <Button className="w-full">Add Money</Button>
          </CardContent>
        </Card>

        <section>
          <SectionHead title={<>Transaction <em className="not-italic text-saffron">history</em></>} />
          {txns.isLoading ? (
            <LoadingState rows={5} />
          ) : txns.isError ? (
            <ErrorState message={(txns.error as Error)?.message} onRetry={() => txns.refetch()} />
          ) : history.length === 0 ? (
            <EmptyState title="No transactions yet" message="Add money or pay a bill to see activity here." icon={<History className="h-6 w-6" />} />
          ) : (
            <TransactionList items={history} />
          )}
        </section>
      </div>
    </UserShell>
  );
};

export default UserWallet;
