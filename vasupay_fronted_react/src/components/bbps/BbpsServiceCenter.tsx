import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  Lightbulb, Smartphone, Tv, Wifi, Droplet, Flame, Car, ShieldCheck, Banknote,
  CreditCard, Building2, GraduationCap, Repeat, HeartHandshake, TrainFront,
  PiggyBank, ReceiptText, Users, Gauge, Zap, ArrowLeft, CheckCircle2, XCircle, Wallet, Clock,
  Truck, Phone, Landmark, Home, MessageSquare, type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SectionHead, LoadingState, ErrorState } from "@/components/vasu";
import { BbpsBrandBar } from "./BbpsBrandBar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useBbpsServices, useBillers } from "@/hooks/useBbps";
import { useWalletBalances } from "@/hooks/useVasuData";
import { primaryBalance } from "@/api/userApi";
import {
  fetchBill, validateBill, payBill, extractBillerConfigs, billerFlow, isBbpsOk,
  parseEnumOptions, extractPlans,
  type BbpsServiceItem, type BbpsEnvelope, type BillerConfig,
} from "@/api/bbpsApi";

const ICONS: Record<string, LucideIcon> = {
  Lightbulb, Smartphone, Tv, Wifi, Droplet, Flame, Car, ShieldCheck, Banknote,
  CreditCard, Building2, GraduationCap, Repeat, HeartHandshake, TrainFront,
  PiggyBank, ReceiptText, Users, Gauge, Zap, Truck, Phone, Landmark, Home,
};
const TONES = ["bg-saffron-glow text-saffron", "bg-vasu-pale text-vasu-deep", "bg-gold-soft text-[#8A5F00]", "bg-[#D4ECF5] text-[#1F5F7E]"];
const inr = (n: number) => `₹${(Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const ASSURED = "/bharat-connect/assured.png";
const BC_LOGO = "/bharat-connect/logo.svg";
const SUCCESS_SOUND = "/bharat-connect/success.wav";

/** Top-right logo for the modal: B-Assured on success (no box), else Bharat Connect. */
function ModalTopLogo({ assured }: { assured?: boolean }) {
  return (
    <div className="flex justify-end">
      {assured
        ? <img src={ASSURED} alt="Bharat Connect Assured" className="h-12 w-12" />
        : <img src={BC_LOGO} alt="Bharat Connect" className="h-6 w-auto" />}
    </div>
  );
}

export function BbpsServiceCenter({ mode = "customer" }: { mode?: "customer" | "agent" }) {
  const { user } = useAuth();
  const services = useBbpsServices();
  const [selected, setSelected] = useState<BbpsServiceItem | null>(null);

  return (
    <div className="space-y-6">
      <BbpsBrandBar
        airtelLogo={services.data?.logos?.airtel}
        bharatConnectLogo={services.data?.logos?.bharat_connect}
        environment={services.data?.environment}
        poweredBy={services.data?.powered_by}
      />

      {!selected ? (
        <section>
          <SectionHead title={<>Bharat Connect <em className="not-italic text-saffron">services</em></>} />
          {services.isLoading ? (
            <LoadingState rows={3} />
          ) : services.isError ? (
            <ErrorState message={(services.error as Error)?.message} onRetry={() => services.refetch()} />
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {(services.data?.services || []).map((s, i) => {
                const Icon = ICONS[s.icon] || Zap;
                return (
                  <button key={s.id} onClick={() => setSelected(s)}
                    className="flex flex-col items-center rounded-2xl border border-border bg-card px-2 py-4 text-center transition hover:-translate-y-0.5 hover:shadow-md">
                    <span className={`mb-2 flex h-11 w-11 items-center justify-center rounded-xl ${TONES[i % TONES.length]}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[11px] font-semibold leading-tight text-graphite">{s.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <BillPayFlow service={selected} mode={mode} defaultMobile={user?.phone || ""} onBack={() => setSelected(null)} />
      )}
    </div>
  );
}

function BillPayFlow({
  service, mode, defaultMobile, onBack,
}: {
  service: BbpsServiceItem;
  mode: "customer" | "agent";
  defaultMobile: string;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload the success sound and "unlock" it on the first user interaction
  // anywhere on the page, so the later play() (≈6s after the pay click, once the
  // provider responds) isn't blocked by the browser autoplay policy.
  useEffect(() => {
    const el = new Audio(SUCCESS_SOUND);
    el.preload = "auto";
    audioRef.current = el;
    const unlock = () => {
      el.muted = true;
      el.play().then(() => { el.pause(); el.currentTime = 0; el.muted = false; }).catch(() => { el.muted = false; });
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  // Create + "unlock" the success sound during the user gesture (click), so the
  // delayed play() after the async payment isn't blocked by autoplay policy.
  const primeAudio = () => {
    try {
      if (!audioRef.current) audioRef.current = new Audio(SUCCESS_SOUND);
      const a = audioRef.current;
      a.muted = true;
      a.play().then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(() => { a.muted = false; });
    } catch { /* ignore */ }
  };
  const playSuccessSound = () => {
    try {
      const a = audioRef.current || new Audio(SUCCESS_SOUND);
      a.muted = false; a.volume = 0.9; a.currentTime = 0;
      a.play().catch(() => {});
    } catch { /* ignore */ }
  };

  const billers = useBillers(service.id);
  const configs = extractBillerConfigs(billers.data);
  const balances = useWalletBalances();
  const walletBalance = primaryBalance(balances.data?.wallets);

  const [billerId, setBillerId] = useState("");
  const config: BillerConfig | undefined =
    configs.find((c) => c.id === billerId) ||
    (billerId ? { id: billerId, name: billerId, references: [{ key: "reference1", label: "Consumer Number" }], fetchAndPay: true, validateAndPay: false } : undefined);
  const flow = config ? billerFlow(config) : "fetch";

  const [refs, setRefs] = useState<Record<string, string>>({});
  const [mobile, setMobile] = useState(defaultMobile);
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyMobile, setNotifyMobile] = useState("");

  const fetchMut = useMutation({ mutationFn: fetchBill });
  const validateMut = useMutation({ mutationFn: validateBill });
  const payMut = useMutation({ mutationFn: payBill });
  const lookupMut = flow === "validate" ? validateMut : fetchMut;

  useEffect(() => {
    setRefs({}); setAmount(""); setOpen(false); setConfirming(false);
    setNotifySms(false); setNotifyMobile("");
    fetchMut.reset(); validateMut.reset(); payMut.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billerId]);

  const lookup = lookupMut.data as BbpsEnvelope | undefined;
  // v1 nested the bill under data.billerResponse; v2 returns it directly on data.
  const billerResponse = lookup?.data?.billerResponse ?? lookup?.data;
  const bbpouRefId = lookup?.data?.bbpouRefId as string | undefined;
  const fetchedAmount = billerResponse?.amount as string | undefined;
  const lookupOk = isBbpsOk(lookup);
  const plans = extractPlans(billerResponse?.additionalInfos);
  const payResult = payMut.data as BbpsEnvelope | undefined;
  const payOk = isBbpsOk(payResult);
  const payPending = payResult?.meta?.status === 2;

  const refsFilled = (config?.references || []).every((r) => (refs[r.key] || "").trim().length > 0);
  const mobileRef = config?.references.find((r) => /mobile/i.test(r.label || "") && !(r.label || "").includes("/"));
  const effectiveMobile = mobileRef ? (refs[mobileRef.key] || "") : mobile;
  const mobileValid = /^[6-9]\d{9}$/.test(effectiveMobile.trim());
  const canLookup = !!config && refsFilled && mobileValid && !lookupMut.isPending;
  const amountValid = !!amount && Number(amount) > 0;

  const onLookup = () => {
    payMut.reset();
    lookupMut.mutate(
      { biller_id: config!.id, references: refs, mobile_number: effectiveMobile, customer_name: customerName || undefined },
      { onSuccess: (env) => { setAmount((env?.data?.billerResponse?.amount as string) || ""); setOpen(true); setConfirming(false); } }
    );
  };

  const doPay = () => {
    primeAudio(); // unlock within the click gesture
    payMut.mutate(
      {
        bbpou_ref_id: bbpouRefId, biller_id: config!.id, references: refs,
        payment_amount: amount || fetchedAmount || "0", mobile_number: effectiveMobile,
        customer_name: customerName || undefined, from_wallet: true, service: service.name,
        notify_sms: notifySms,
        notify_mobile: notifySms ? (notifyMobile || effectiveMobile) : undefined,
      },
      // Play on success OR initiated (status 0 or 2) — both are accepted payments.
      { onSuccess: (env) => { const s = env?.meta?.status; if (s === 0 || s === 2) playSuccessSound(); } }
    );
  };

  const setRef = (k: string, v: string) => setRefs((p) => ({ ...p, [k]: v }));
  const addMoney = () => { setOpen(false); navigate("/user/wallet"); };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
          <CardTitle className="font-display">{mode === "agent" ? "Collect" : "Pay"} · {service.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Biller */}
        <div className="space-y-2">
          <Label>Biller</Label>
          {billers.isLoading ? (
            <LoadingState rows={1} />
          ) : billers.isError ? (
            <ErrorState message={(billers.error as Error)?.message} onRetry={() => billers.refetch()} />
          ) : configs.length > 0 ? (
            <Select value={billerId} onValueChange={setBillerId}>
              <SelectTrigger><SelectValue placeholder={`Select ${service.name} biller`} /></SelectTrigger>
              <SelectContent>{configs.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
          ) : (
            <Input placeholder="Enter biller ID" value={billerId} onChange={(e) => setBillerId(e.target.value)} />
          )}
        </div>

        {config && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {config.references.map((r) => {
                const enumOpts = parseEnumOptions(r.validations?.regex?.value);
                return (
                  <div key={r.key} className="space-y-2">
                    <Label>{r.label}</Label>
                    {enumOpts ? (
                      <Select value={refs[r.key] || ""} onValueChange={(v) => setRef(r.key, v)}>
                        <SelectTrigger><SelectValue placeholder={`Select ${r.label}`} /></SelectTrigger>
                        <SelectContent>{enumOpts.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                      </Select>
                    ) : (
                      <Input
                        inputMode={["N", "NUM", "NUMERIC"].includes((r.type || "").toUpperCase()) ? "numeric" : "text"}
                        placeholder={r.label} value={refs[r.key] || ""} onChange={(e) => setRef(r.key, e.target.value)} />
                    )}
                  </div>
                );
              })}
              {!mobileRef && (
                <div className="space-y-2">
                  <Label>{mode === "agent" ? "Customer Mobile" : "Mobile Number"} <span className="text-destructive">*</span></Label>
                  <Input inputMode="numeric" maxLength={10} placeholder="10-digit mobile"
                    value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} />
                  {mobile.length > 0 && !mobileValid && <p className="text-xs text-destructive">Enter a valid 10-digit mobile number.</p>}
                </div>
              )}
              {mode === "agent" && (
                <div className="space-y-2">
                  <Label>Customer Name (optional)</Label>
                  <Input placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
              )}
            </div>

            {flow === "direct" ? (
              <>
                <div className="space-y-2">
                  <Label>Recharge Amount (₹)</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
                </div>
                <Button className="w-full bg-saffron text-white hover:brightness-105"
                  onClick={() => { setConfirming(true); setOpen(true); }}
                  disabled={!amountValid || !refsFilled || !mobileValid}>
                  Proceed to Pay {amountValid ? inr(Number(amount)) : ""}
                </Button>
              </>
            ) : (
              <Button className="w-full" onClick={onLookup} disabled={!canLookup}>
                {lookupMut.isPending ? "Fetching…" : flow === "validate" ? "Validate Bill" : "Fetch Bill"}
              </Button>
            )}
            {lookupMut.isError && <ErrorState message={(lookupMut.error as Error)?.message} />}
          </>
        )}
      </CardContent>

      {/* Bill / plan / confirm / receipt modal */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setConfirming(false); }}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <ModalTopLogo assured={!!(payResult && payOk)} />
            <DialogTitle className="font-display">
              {payResult
                ? payOk ? "Payment Successful" : payPending ? "Payment Initiated" : "Payment Failed"
                : confirming ? "Confirm Payment" : service.name + " — Bill Details"}
            </DialogTitle>
          </DialogHeader>

          {payResult ? (
            <PayResult res={payResult} amount={amount} />
          ) : flow !== "direct" && lookup && !lookupOk ? (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">{lookup?.meta?.description || "Could not fetch bill"}</p>
                {lookup?.meta?.code && <p className="font-mono text-xs text-muted-foreground">Code: {lookup.meta.code}</p>}
              </div>
            </div>
          ) : confirming ? (
            <ConfirmPay
              amount={Number(amount || fetchedAmount || 0)}
              balance={walletBalance}
              loading={balances.isLoading}
              mode={mode}
              pending={payMut.isPending}
              error={payMut.isError ? (payMut.error as Error)?.message : undefined}
              notifySms={notifySms}
              onNotifySmsChange={setNotifySms}
              notifyMobile={notifyMobile || effectiveMobile}
              onNotifyMobileChange={setNotifyMobile}
              onConfirm={doPay}
              onCancel={() => setConfirming(false)}
              onAddMoney={addMoney}
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-secondary/40 p-4 text-sm">
                {[
                  ["Customer", billerResponse?.customerName],
                  ["Bill Number", billerResponse?.billNumber],
                  ["Bill Date", billerResponse?.billDate],
                  ["Due Date", billerResponse?.billDueDate],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-0.5"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
                ))}
                {fetchedAmount && (
                  <div className="mt-1 flex justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">Bill Amount</span>
                    <span className="font-display text-lg font-semibold">{inr(Number(fetchedAmount))}</span>
                  </div>
                )}
              </div>

              {plans.length > 0 && (
                <div className="space-y-2">
                  <Label>Choose a plan</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {plans.map((p) => {
                      const active = amount === String(p.amount);
                      return (
                        <button key={p.label + p.raw} onClick={() => setAmount(String(p.amount))}
                          className={cn("rounded-xl border p-3 text-left transition", active ? "border-saffron bg-saffron/5" : "border-border hover:shadow-sm")}>
                          <p className="text-xs font-medium text-graphite">{p.label}</p>
                          <p className="font-display text-base font-semibold text-vasu-deep">{inr(p.amount)}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(billerResponse?.additionalInfos || []).length > 0 && (
                <details className="rounded-xl border border-border p-3 text-sm">
                  <summary className="cursor-pointer font-medium text-vasu-deep">Bill details</summary>
                  <div className="mt-2 space-y-1">
                    {(billerResponse?.additionalInfos || []).map((ai: any, i: number) => (
                      <div key={i} className="flex justify-between gap-3">
                        <span className="text-muted-foreground">{ai?.name}</span>
                        <span className="text-right font-medium">{ai?.value}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <div className="space-y-2">
                <Label>Amount to pay (₹)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <Button className="w-full bg-saffron text-white hover:brightness-105"
                onClick={() => setConfirming(true)} disabled={!amountValid}>
                Proceed to Pay {amountValid ? inr(Number(amount)) : ""}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ConfirmPay({
  amount, balance, loading, mode, pending, error,
  notifySms, onNotifySmsChange, notifyMobile, onNotifyMobileChange,
  onConfirm, onCancel, onAddMoney,
}: {
  amount: number; balance: number; loading: boolean; mode: "customer" | "agent";
  pending: boolean; error?: string;
  notifySms: boolean; onNotifySmsChange: (v: boolean) => void;
  notifyMobile: string; onNotifyMobileChange: (v: string) => void;
  onConfirm: () => void; onCancel: () => void; onAddMoney: () => void;
}) {
  const enough = balance >= amount;
  const smsMobileValid = /^[6-9]\d{9}$/.test((notifyMobile || "").trim());
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <img src={ASSURED} alt="Bharat Connect Assured" className="h-16 w-16 flex-shrink-0" />
        <div>
          <p className="font-display text-base font-semibold text-vasu-deep">Pay {inr(amount)}</p>
          <p className="text-sm text-muted-foreground">Securely from your Vasu Wallet · Bharat Connect Assured</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-4 w-4" /> Wallet balance</span>
        <span className={cn("font-display font-semibold", enough ? "text-vasu-deep" : "text-destructive")}>
          {loading ? "…" : inr(balance)}
        </span>
      </div>

      {/* SMS notification opt-in */}
      <div className="rounded-xl border border-border p-3">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <Checkbox checked={notifySms} onCheckedChange={(v) => onNotifySmsChange(v === true)} />
          <span className="flex items-center gap-1.5 font-medium text-vasu-deep">
            <MessageSquare className="h-4 w-4 text-saffron" /> Notify via SMS
          </span>
        </label>
        {notifySms && (
          <div className="mt-3 space-y-1">
            <Label className="text-xs text-muted-foreground">Mobile number for SMS</Label>
            <Input
              inputMode="numeric" maxLength={10} placeholder="10-digit mobile"
              value={notifyMobile}
              onChange={(e) => onNotifyMobileChange(e.target.value.replace(/\D/g, ""))}
            />
            {!smsMobileValid && (notifyMobile || "").length > 0 && (
              <p className="text-xs text-destructive">Enter a valid 10-digit mobile number.</p>
            )}
            <p className="text-xs text-muted-foreground">
              A confirmation SMS is sent once the payment is successful or initiated.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <Button className="w-full" disabled>Checking balance…</Button>
      ) : enough ? (
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={pending}>Cancel</Button>
          <Button className="flex-1 bg-saffron text-white hover:brightness-105" onClick={onConfirm}
            disabled={pending || (notifySms && !smsMobileValid)}>
            {pending ? "Paying…" : `Confirm & Pay ${inr(amount)}`}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-destructive">
            Insufficient balance — you need {inr(amount - balance)} more.
          </p>
          {mode === "customer" ? (
            <Button className="w-full bg-saffron text-white hover:brightness-105" onClick={onAddMoney}>Add Money to Wallet</Button>
          ) : (
            <p className="rounded-lg bg-secondary/40 p-3 text-xs text-muted-foreground">Top up your float balance to continue collecting payments.</p>
          )}
          <Button variant="outline" className="w-full" onClick={onCancel}>Cancel</Button>
        </div>
      )}
    </div>
  );
}

function PayResult({ res, amount }: { res: BbpsEnvelope; amount: string }) {
  const status = res.meta?.status;
  const ok = status === 0;
  const pending = status === 2; // initiated / processing
  return (
    <div className="space-y-3 text-center">
      {ok ? (
        <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <p className="font-display text-xl font-semibold text-success">Payment Successful</p>
          <p className="text-2xl font-display font-semibold text-vasu-deep">{inr(Number(amount))}</p>
        </>
      ) : pending ? (
        <>
          <Clock className="mx-auto h-12 w-12 text-warning" />
          <p className="font-display text-lg font-semibold text-warning">{res.meta?.description || "Payment Initiated"}</p>
          <p className="text-2xl font-display font-semibold text-vasu-deep">{inr(Number(amount))}</p>
          <p className="text-xs text-muted-foreground">Amount debited. Status will be confirmed shortly.</p>
        </>
      ) : (
        <>
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <p className="font-display text-lg font-semibold text-destructive">{res.meta?.description || "Payment failed"}</p>
          <p className="text-xs text-muted-foreground">Amount refunded to your wallet.</p>
        </>
      )}
      {res.data?.bbpouRefId && (
        <div className="mt-2 rounded-lg bg-secondary/40 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Bharat Connect Txn ID</span>
          <p className="font-mono font-medium text-ink break-all">{res.data.bbpouRefId}</p>
        </div>
      )}
      {res._wallet && (
        <p className="text-sm text-muted-foreground">Wallet balance: <span className="font-semibold text-vasu-deep">{inr(Number(res._wallet.balance))}</span></p>
      )}
    </div>
  );
}
