import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Clock, UserPlus, Search } from "lucide-react";
import { BbpsBrandBar } from "@/components/bbps/BbpsBrandBar";
import { useBbpsServices } from "@/hooks/useBbps";
import { registerAgent, agentInquiry, type BbpsEnvelope, type AgentRegisterPayload } from "@/api/bbpsApi";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

const empty: AgentRegisterPayload = {
  mobile_number: "", pan: "", dob: "", agent_name: "", agent_shop_name: "",
  address_line1: "", address_line2: "", state: "", city: "", pin_code: 0,
  latitude: "", longitude: "",
};

function MetaResult({ env, title }: { env: BbpsEnvelope; title: string }) {
  const s = env.meta?.status;
  const ok = s === 0;
  const pending = s === 2;
  const Icon = ok ? CheckCircle2 : pending ? Clock : XCircle;
  const color = ok ? "text-success" : pending ? "text-warning" : "text-destructive";
  const border = ok ? "border-success/30 bg-success/5" : pending ? "border-warning/30 bg-warning/5" : "border-destructive/30 bg-destructive/5";
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${border}`}>
      <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${color}`} />
      <div className="min-w-0 text-sm">
        <p className={`font-medium ${color}`}>{title}: {env.meta?.description || (ok ? "Success" : "Failed")}</p>
        {env.meta?.code && <p className="font-mono text-xs text-muted-foreground">Code: {env.meta.code}</p>}
        {env.data?.agentId && <p className="text-xs">Agent ID: <span className="font-mono">{env.data.agentId}</span></p>}
      </div>
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const AdminAgentRegistration = () => {
  const services = useBbpsServices();
  const [form, setForm] = useState<AgentRegisterPayload>(empty);
  const [inqMobile, setInqMobile] = useState("");

  const regMut = useMutation({ mutationFn: registerAgent });
  const inqMut = useMutation({ mutationFn: agentInquiry });

  const set = (k: keyof AgentRegisterPayload, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan.trim().toUpperCase());
  const mobileValid = /^[6-9]\d{9}$/.test(form.mobile_number.trim());
  const dobValid = /^\d{2}\/\d{2}\/\d{4}$/.test(form.dob.trim());
  const pinValid = /^\d{6}$/.test(String(form.pin_code || ""));
  const canSubmit =
    mobileValid && panValid && dobValid && pinValid &&
    !!form.agent_name && !!form.agent_shop_name && !!form.address_line1 && !!form.state && !!form.city &&
    !regMut.isPending;

  const submit = () => regMut.mutate({ ...form, pan: form.pan.toUpperCase(), pin_code: Number(form.pin_code) });

  const regRes = regMut.data as BbpsEnvelope | undefined;
  const inqRes = inqMut.data as BbpsEnvelope | undefined;

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Agent Registration" userRole="Super Admin">
      <div className="mx-auto max-w-4xl space-y-6">
        <BbpsBrandBar
          airtelLogo={services.data?.logos?.airtel}
          bharatConnectLogo={services.data?.logos?.bharat_connect}
          environment={services.data?.environment}
          poweredBy={services.data?.powered_by}
        />

        {/* Register */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <UserPlus className="h-5 w-5 text-saffron" /> Onboard BBPS Agent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Mobile Number" required error={form.mobile_number.length > 0 && !mobileValid ? "10-digit mobile" : ""}>
                <Input inputMode="numeric" maxLength={10} placeholder="9876543210"
                  value={form.mobile_number} onChange={(e) => set("mobile_number", e.target.value.replace(/\D/g, ""))} />
              </Field>
              <Field label="PAN" required error={form.pan.length > 0 && !panValid ? "e.g. ABCDE1234Z" : ""}>
                <Input maxLength={10} placeholder="ABCDE1234Z" className="uppercase"
                  value={form.pan} onChange={(e) => set("pan", e.target.value.toUpperCase())} />
              </Field>
              <Field label="Date of Birth (DD/MM/YYYY)" required error={form.dob.length > 0 && !dobValid ? "DD/MM/YYYY" : ""}>
                <Input placeholder="15/08/1990" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
              </Field>
              <Field label="Agent Name" required>
                <Input placeholder="Full name" value={form.agent_name} onChange={(e) => set("agent_name", e.target.value)} />
              </Field>
              <Field label="Shop Name" required>
                <Input placeholder="Shop / business name" value={form.agent_shop_name} onChange={(e) => set("agent_shop_name", e.target.value)} />
              </Field>
              <Field label="Address Line 1" required>
                <Input placeholder="Street address" value={form.address_line1} onChange={(e) => set("address_line1", e.target.value)} />
              </Field>
              <Field label="Address Line 2">
                <Input placeholder="Optional" value={form.address_line2} onChange={(e) => set("address_line2", e.target.value)} />
              </Field>
              <Field label="State" required>
                <Select value={form.state} onValueChange={(v) => set("state", v)}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="City" required>
                <Input placeholder="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
              </Field>
              <Field label="PIN Code" required error={form.pin_code !== 0 && !pinValid ? "6-digit PIN" : ""}>
                <Input inputMode="numeric" maxLength={6} placeholder="400001"
                  value={form.pin_code ? String(form.pin_code) : ""} onChange={(e) => set("pin_code", Number(e.target.value.replace(/\D/g, "")) || 0)} />
              </Field>
              <Field label="Latitude">
                <Input placeholder="19.0760" value={form.latitude} onChange={(e) => set("latitude", e.target.value)} />
              </Field>
              <Field label="Longitude">
                <Input placeholder="72.8777" value={form.longitude} onChange={(e) => set("longitude", e.target.value)} />
              </Field>
            </div>

            <Button className="w-full bg-saffron text-white hover:brightness-105" onClick={submit} disabled={!canSubmit}>
              {regMut.isPending ? "Registering…" : "Register Agent"}
            </Button>
            {regMut.isError && <p className="text-sm text-destructive">{(regMut.error as Error)?.message}</p>}
            {regRes && <MetaResult env={regRes} title="Registration" />}
          </CardContent>
        </Card>

        {/* Inquiry */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Search className="h-5 w-5 text-vasu-green" /> Agent Registration Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input inputMode="numeric" maxLength={10} placeholder="Agent mobile number"
                value={inqMobile} onChange={(e) => setInqMobile(e.target.value.replace(/\D/g, ""))} className="flex-1" />
              <Button variant="secondary" disabled={!/^[6-9]\d{9}$/.test(inqMobile) || inqMut.isPending}
                onClick={() => inqMut.mutate(inqMobile)}>
                {inqMut.isPending ? "Checking…" : "Check Status"}
              </Button>
            </div>
            {inqMut.isError && <p className="text-sm text-destructive">{(inqMut.error as Error)?.message}</p>}
            {inqRes && <MetaResult env={inqRes} title="Inquiry" />}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAgentRegistration;
