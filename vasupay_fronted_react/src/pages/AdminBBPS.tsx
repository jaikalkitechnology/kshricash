import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LayoutDashboard, Users, Wallet, Activity, Settings, FileText, Shield, Database, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NavLink } from "@/components/NavLink";
import { BbpsBrandBar } from "@/components/bbps/BbpsBrandBar";
import { SectionHead, LoadingState, ErrorState, EmptyState } from "@/components/vasu";
import { useBbpsServices, useBillers, useBbpsBalance, useBbpsVersion, useSetBbpsVersion } from "@/hooks/useBbps";
import { extractBillerConfigs, isBbpsOk, type BbpsServiceItem } from "@/api/bbpsApi";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet as WalletIcon, GitBranch } from "lucide-react";

const AdminSidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin" },
    { icon: Users, label: "Partners", path: "/admin/partners" },
    { icon: UserCheck, label: "Users & KYC", path: "/admin/users" },
    { icon: Wallet, label: "Wallets & Finance", path: "/admin/wallets" },
    { icon: Activity, label: "Transactions", path: "/admin/transactions" },
    { icon: Database, label: "Bharat Connect", path: "/admin/bbps" },
    { icon: Shield, label: "Security & Compliance", path: "/admin/security" },
    { icon: FileText, label: "Reports", path: "/admin/reports" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];
  return (
    <nav className="p-4 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.path} to={item.path} end
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium">
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

const fmtBalance = (v: unknown): string => {
  const n = Number(v);
  if (v == null || v === "" || Number.isNaN(n)) return String(v ?? "—");
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const AdminBBPS = () => {
  const services = useBbpsServices();
  const [selected, setSelected] = useState<BbpsServiceItem | null>(null);
  const billers = useBillers(selected?.id);
  const billerRows = extractBillerConfigs(billers.data);

  const version = useBbpsVersion();
  const setVersion = useSetBbpsVersion();
  const activeVersion = version.data?.version;
  const supported = version.data?.supported ?? ["v1", "v2"];

  const balance = useBbpsBalance();
  const env = balance.data;
  const ok = isBbpsOk(env);
  const available = env?.data?.availableBalance ?? env?.data?.balance;
  const errMsg =
    (balance.error as Error)?.message ||
    (env && !ok ? env?.meta?.description || "Balance check failed" : null);

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Bharat Connect" userRole="Super Admin">
      <div className="mx-auto max-w-6xl space-y-6">
        <BbpsBrandBar
          airtelLogo={services.data?.logos?.airtel}
          bharatConnectLogo={services.data?.logos?.bharat_connect}
          environment={services.data?.environment}
          poweredBy={services.data?.powered_by}
        />

        <section>
          <SectionHead title={<>API <em className="not-italic text-saffron">version</em></>} />
          <Card className="shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <GitBranch className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-stone">Active Airtel BBPS API version</p>
                  <p className="text-lg font-semibold text-ink">
                    {version.isLoading ? "Loading…" : (activeVersion?.toUpperCase() ?? "—")}
                  </p>
                  <p className="mt-0.5 text-xs text-stone">
                    Switch to <strong>v1</strong> if v2 endpoints return 403. Applies to bill fetch,
                    payment inquiry and balance check.
                  </p>
                </div>
              </div>
              <div className="inline-flex overflow-hidden rounded-xl border border-border">
                {supported.map((v) => {
                  const isActive = activeVersion === v;
                  return (
                    <button
                      key={v}
                      onClick={() => !isActive && setVersion.mutate(v)}
                      disabled={setVersion.isPending}
                      className={`px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                        isActive
                          ? "bg-saffron text-white"
                          : "bg-card text-ink hover:bg-muted"
                      }`}
                    >
                      {v.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          {setVersion.isError && (
            <p className="mt-2 text-sm text-red-600">
              {(setVersion.error as Error)?.message || "Could not switch version"}
            </p>
          )}
        </section>

        <section>
          <SectionHead title={<>Provider <em className="not-italic text-saffron">balance</em></>} />
          <Card className="shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-saffron/10 text-saffron">
                  <WalletIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-stone">Available balance at Airtel Payments Bank</p>
                  {balance.isPending ? (
                    <p className="text-lg font-semibold text-ink">Checking…</p>
                  ) : ok && available != null ? (
                    <p className="text-2xl font-bold text-ink">{fmtBalance(available)}</p>
                  ) : errMsg ? (
                    <p className="text-sm font-medium text-red-600">{errMsg}</p>
                  ) : (
                    <p className="text-lg font-semibold text-stone">Not checked yet</p>
                  )}
                </div>
              </div>
              <Button
                onClick={() => balance.mutate()}
                disabled={balance.isPending}
                className="bg-saffron text-white hover:bg-saffron/90"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${balance.isPending ? "animate-spin" : ""}`} />
                {balance.isPending ? "Checking…" : "Check Balance"}
              </Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <SectionHead title={<>Service <em className="not-italic text-saffron">categories</em></>} />
          {services.isLoading ? (
            <LoadingState rows={3} />
          ) : services.isError ? (
            <ErrorState message={(services.error as Error)?.message} onRetry={() => services.refetch()} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {(services.data?.services || []).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={`rounded-2xl border p-4 text-left transition hover:shadow-md ${
                    selected?.id === s.id ? "border-saffron bg-saffron/5" : "border-border bg-card"
                  }`}
                >
                  <p className="font-semibold text-ink">{s.name}</p>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-stone">{s.group}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        {selected && (
          <section>
            <SectionHead title={<>Billers · <em className="not-italic text-saffron">{selected.name}</em></>} />
            <Card className="shadow-sm">
              <CardContent className="p-4">
                {billers.isLoading ? (
                  <LoadingState rows={5} />
                ) : billers.isError ? (
                  <ErrorState message={(billers.error as Error)?.message} onRetry={() => billers.refetch()} />
                ) : billerRows.length === 0 ? (
                  <EmptyState title="No billers" message={`No billers returned for ${selected.name}.`} icon={<Database className="h-6 w-6" />} />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Biller ID</TableHead>
                        <TableHead>Biller Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billerRows.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-mono text-xs">{b.id}</TableCell>
                          <TableCell className="font-medium">{b.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminBBPS;
