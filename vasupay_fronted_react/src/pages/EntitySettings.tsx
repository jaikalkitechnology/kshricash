import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import EntitySidebar from "@/components/EntitySidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, User, Phone, Mail, MapPin, Shield } from "lucide-react";
import { getEntityProfile } from "@/api/entityApi";

const ENTITY_LABELS: Record<string, string> = { white_label: "White Label", agency: "Agency", distributor: "Distributor", partner: "Partner", retailer: "Retailer" };
const ROUTE_BASE: Record<string, string> = { white_label: "/white-label", agency: "/agency", distributor: "/distributor", partner: "/partner", retailer: "/retailer" };

const EntitySettings = () => {
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
      toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebar={<EntitySidebar basePath={basePath} canManageChildren={true} />} title="Settings" userRole={label}>
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        ) : profile ? (
          <>
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{profile.full_name || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{profile.phone || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{profile.email || "-"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Entity Type</p>
                        <Badge variant="secondary" className="capitalize">{profile.entity_type?.replace("_", " ") || "-"}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={profile.is_active ? "default" : "destructive"}>{profile.is_active ? "Active" : "Inactive"}</Badge>
                      </div>
                    </div>
                    {profile.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="font-medium">{[profile.address, profile.city, profile.state, profile.pincode].filter(Boolean).join(", ")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {profile.kyc_status && (
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <CardTitle>KYC Status</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Badge variant={profile.kyc_status === "verified" ? "default" : profile.kyc_status === "pending" ? "secondary" : "destructive"} className="text-base px-4 py-1">
                      {profile.kyc_status}
                    </Badge>
                    {profile.kyc_status === "verified" && <span className="text-sm text-muted-foreground">Your KYC has been verified</span>}
                    {profile.kyc_status === "pending" && <span className="text-sm text-muted-foreground">Your KYC is under review</span>}
                    {profile.kyc_status === "rejected" && <span className="text-sm text-muted-foreground">Your KYC was rejected. Please contact your parent entity.</span>}
                  </div>
                </CardContent>
              </Card>
            )}

            {profile.wallets && profile.wallets.length > 0 && (
              <Card className="shadow-md">
                <CardHeader><CardTitle>Wallet Limits</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.wallets.map((w: any) => (
                      <div key={w.id} className="p-4 rounded-lg border">
                        <p className="font-medium capitalize">{w.wallet_type} Wallet</p>
                        <p className="text-2xl font-bold mt-1">₹{Number(w.balance).toLocaleString()}</p>
                        {w.daily_limit && <p className="text-sm text-muted-foreground mt-1">Daily Limit: ₹{Number(w.daily_limit).toLocaleString()}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Failed to load profile information</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EntitySettings;
