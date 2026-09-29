import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import EntitySidebar from "@/components/EntitySidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Zap, CreditCard, Smartphone, Building2 } from "lucide-react";
import { getEntityProfile } from "@/api/entityApi";

const ENTITY_LABELS: Record<string, string> = { white_label: "White Label", agency: "Agency", distributor: "Distributor", partner: "Partner", retailer: "Retailer" };
const ROUTE_BASE: Record<string, string> = { white_label: "/white-label", agency: "/agency", distributor: "/distributor", partner: "/partner", retailer: "/retailer" };

const SERVICE_INFO: Record<string, { label: string; icon: any; description: string }> = {
  bbps: { label: "BBPS", icon: Building2, description: "Bharat Bill Payment System - Pay utility bills" },
  aeps: { label: "AEPS", icon: CreditCard, description: "Aadhaar Enabled Payment System" },
  dmt: { label: "DMT", icon: Zap, description: "Domestic Money Transfer" },
  recharge: { label: "Recharge", icon: Smartphone, description: "Mobile & DTH Recharge" },
  payout: { label: "Payout", icon: CreditCard, description: "Bank account payouts" },
};

const EntityServices = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const entityType = user?.entity_type || "partner";
  const label = ENTITY_LABELS[entityType] || entityType;
  const basePath = ROUTE_BASE[entityType] || "/user";

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getEntityProfile();
      setProfile(data);
    } catch {
      toast({ title: "Error", description: "Failed to load services", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const allowed: string[] = profile?.allowed_services || [];
  const blocked: string[] = profile?.blocked_services || [];
  const allServices = Object.keys(SERVICE_INFO);

  return (
    <DashboardLayout sidebar={<EntitySidebar basePath={basePath} canManageChildren={false} />} title="Services" userRole={label}>
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Available Services</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : (
              <div className="space-y-3">
                {allServices.map((code) => {
                  const info = SERVICE_INFO[code];
                  const Icon = info.icon;
                  const isAllowed = allowed.length === 0 || allowed.includes(code);
                  const isBlocked = blocked.includes(code);
                  const active = isAllowed && !isBlocked;

                  return (
                    <div key={code} className={`flex items-center justify-between p-4 rounded-lg border ${active ? "bg-background" : "bg-muted/50 opacity-60"}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${active ? "bg-primary/10" : "bg-muted"}`}>
                          <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="font-medium">{info.label}</p>
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                        </div>
                      </div>
                      <Badge variant={active ? "default" : "secondary"}>{active ? "Active" : "Disabled"}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EntityServices;
