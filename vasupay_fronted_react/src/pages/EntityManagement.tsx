import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import EntitySidebar from "@/components/EntitySidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Plus, Lock, Unlock, Eye, Edit, Wallet, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import {
  getChildren, getChildDetail, createChild, updateChild, toggleChildLock,
  loadChildWallet, getChildServices, toggleChildService, getEntityDashboard,
} from "@/api/entityApi";

const STATUS_OPTIONS = ["active", "inactive", "suspended", "blocked"];
const ALL_SERVICES = ["bbps", "aeps", "dmt", "recharge", "upi", "payout", "insurance", "pan_card"];

const ENTITY_LABELS: Record<string, string> = {
  white_label: "White Label", agency: "Agency", distributor: "Distributor",
  partner: "Partner", retailer: "Retailer",
};
const ROUTE_BASE: Record<string, string> = {
  white_label: "/white-label", agency: "/agency", distributor: "/distributor",
  partner: "/partner", retailer: "/retailer",
};

const EntityManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const entityType = user?.entity_type || "partner";
  const label = ENTITY_LABELS[entityType] || entityType;
  const basePath = ROUTE_BASE[entityType] || "/user";

  const [creatableTypes, setCreatableTypes] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    full_name: "", phone: "", email: "", password: "", entity_type: "",
    address: "", city: "", state: "", pincode: "",
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);

  // Wallet load dialog
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletChildId, setWalletChildId] = useState(0);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletDesc, setWalletDesc] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);

  // Services dialog
  const [servicesOpen, setServicesOpen] = useState(false);
  const [servicesChildId, setServicesChildId] = useState(0);
  const [servicesData, setServicesData] = useState<any>(null);
  const [servicesLoading, setServicesLoading] = useState(false);

  useEffect(() => {
    loadCreatableTypes();
  }, []);

  useEffect(() => { loadData(); }, [page]);

  useEffect(() => {
    const createType = searchParams.get("create");
    if (createType && creatableTypes.includes(createType)) {
      setCreateData(prev => ({ ...prev, entity_type: createType }));
      setCreateOpen(true);
    }
  }, [searchParams, creatableTypes]);

  const loadCreatableTypes = async () => {
    try {
      const dash = await getEntityDashboard();
      setCreatableTypes(dash.creatable_types || []);
      if (dash.creatable_types?.length > 0 && !createData.entity_type) {
        setCreateData(prev => ({ ...prev, entity_type: dash.creatable_types[0] }));
      }
    } catch {}
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: 20 };
      if (search) params.search = search;
      if (typeFilter && typeFilter !== "all") params.entity_type = typeFilter;
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      const data = await getChildren(params);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load entities", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { setPage(1); loadData(); };

  const handleViewDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      setDetailOpen(true);
      const data = await getChildDetail(id);
      setDetail(data);
    } catch {
      toast({ title: "Error", description: "Failed to load detail", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setCreateLoading(true);
      await createChild(createData);
      toast({ title: "Success", description: "Entity created successfully" });
      setCreateOpen(false);
      setCreateData({ full_name: "", phone: "", email: "", password: "", entity_type: creatableTypes[0] || "", address: "", city: "", state: "", pincode: "" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.detail || "Failed to create", variant: "destructive" });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditOpen = (item: any) => {
    setEditData({ id: item.id, full_name: item.full_name, email: item.email, status: item.status });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    try {
      setEditLoading(true);
      const { id, ...payload } = editData;
      await updateChild(id, payload);
      toast({ title: "Success", description: "Entity updated" });
      setEditOpen(false);
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.detail || "Failed to update", variant: "destructive" });
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleLock = async (id: number, isLocked: boolean) => {
    try {
      await toggleChildLock(id, !isLocked);
      toast({ title: "Success", description: `Entity ${isLocked ? "unlocked" : "locked"}` });
      loadData();
    } catch {
      toast({ title: "Error", description: "Failed to toggle lock", variant: "destructive" });
    }
  };

  const handleWalletOpen = (childId: number) => {
    setWalletChildId(childId);
    setWalletAmount("");
    setWalletDesc("");
    setWalletOpen(true);
  };

  const handleWalletLoad = async () => {
    const amt = parseFloat(walletAmount);
    if (isNaN(amt) || amt <= 0) {
      toast({ title: "Error", description: "Enter a valid positive amount", variant: "destructive" });
      return;
    }
    try {
      setWalletLoading(true);
      const res = await loadChildWallet(walletChildId, amt, walletDesc || "Wallet load");
      toast({ title: "Success", description: res.message });
      setWalletOpen(false);
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.detail || "Failed to load wallet", variant: "destructive" });
    } finally {
      setWalletLoading(false);
    }
  };

  const handleServicesOpen = async (childId: number) => {
    try {
      setServicesLoading(true);
      setServicesChildId(childId);
      setServicesOpen(true);
      const data = await getChildServices(childId);
      setServicesData(data);
    } catch {
      toast({ title: "Error", description: "Failed to load services", variant: "destructive" });
    } finally {
      setServicesLoading(false);
    }
  };

  const handleToggleService = async (serviceCode: string, enabled: boolean) => {
    try {
      const res = await toggleChildService(servicesChildId, serviceCode, enabled);
      setServicesData({ ...servicesData, allowed_services: res.allowed_services, blocked_services: res.blocked_services });
      toast({ title: "Success", description: res.message });
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.detail || "Failed", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout sidebar={<EntitySidebar basePath={basePath} canManageChildren={creatableTypes.length > 0} />} title="Entity Management" userRole={label}>
      <div className="space-y-6">
        {/* Filters */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Input placeholder="Search by name, phone, email..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
              </div>
              {creatableTypes.length > 1 && (
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Entity Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {creatableTypes.map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}><Search className="h-4 w-4 mr-2" />Search</Button>
              {creatableTypes.length > 0 && (
                <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Entity</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-md">
          <CardHeader><CardTitle>Entities ({total})</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>KYC</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.full_name}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{item.entity_type?.replace('_', ' ')}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={item.kyc_status === "verified" ? "default" : item.kyc_status === "pending" ? "secondary" : "destructive"}>
                            {item.kyc_status}
                          </Badge>
                        </TableCell>
                        <TableCell><Badge variant={item.status === "active" ? "default" : "destructive"}>{item.status}</Badge></TableCell>
                        <TableCell className="text-right font-semibold">₹{item.wallet_balance?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" title="View" onClick={() => handleViewDetail(item.id)}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" title="Edit" onClick={() => handleEditOpen(item)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" title="Load Wallet" onClick={() => handleWalletOpen(item.id)}><Wallet className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" title="Services" onClick={() => handleServicesOpen(item.id)}><Zap className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" title={item.is_locked ? "Unlock" : "Lock"} onClick={() => handleToggleLock(item.id, item.is_locked)}>
                              {item.is_locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No entities found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {page} of {pages} ({total} total)</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Entity Detail</DialogTitle></DialogHeader>
            {detailLoading ? (
              <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
            ) : detail ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Name</Label><p className="font-medium">{detail.full_name}</p></div>
                  <div><Label className="text-muted-foreground">Phone</Label><p className="font-medium">{detail.phone}</p></div>
                  <div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{detail.email || "-"}</p></div>
                  <div><Label className="text-muted-foreground">Type</Label><Badge variant="secondary" className="capitalize">{detail.entity_type?.replace('_', ' ')}</Badge></div>
                  <div><Label className="text-muted-foreground">Status</Label><Badge variant={detail.status === "active" ? "default" : "destructive"}>{detail.status}</Badge></div>
                  <div><Label className="text-muted-foreground">KYC</Label><Badge variant={detail.kyc_status === "verified" ? "default" : "secondary"}>{detail.kyc_status}</Badge></div>
                  <div><Label className="text-muted-foreground">Location</Label><p className="font-medium">{[detail.city, detail.state].filter(Boolean).join(", ") || "-"}</p></div>
                  <div><Label className="text-muted-foreground">Sub-entities</Label><p className="font-medium">{detail.child_count}</p></div>
                  <div><Label className="text-muted-foreground">Services</Label><div className="flex flex-wrap gap-1">{(detail.allowed_services || []).map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}{(detail.allowed_services || []).length === 0 && <span className="text-muted-foreground text-sm">None</span>}</div></div>
                </div>
                {detail.wallets?.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Wallets</Label>
                    <div className="space-y-2 mt-1">{detail.wallets.map((w: any) => (
                      <div key={w.id} className="flex justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="capitalize">{w.purpose}</span>
                        <span className="font-semibold">₹{Number(w.balance).toLocaleString()}</span>
                      </div>
                    ))}</div>
                  </div>
                )}
                {detail.recent_transactions?.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Recent Transactions</Label>
                    <Table>
                      <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Service</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                      <TableBody>{detail.recent_transactions.map((t: any) => (
                        <TableRow key={t.id}>
                          <TableCell>{t.id}</TableCell>
                          <TableCell>{t.service_type || "-"}</TableCell>
                          <TableCell>₹{Number(t.amount).toLocaleString()}</TableCell>
                          <TableCell><Badge variant={t.status === "success" ? "default" : "destructive"}>{t.status}</Badge></TableCell>
                        </TableRow>
                      ))}</TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Entity</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Entity Type *</Label>
                <Select value={createData.entity_type} onValueChange={(v) => setCreateData({ ...createData, entity_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{creatableTypes.map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Full Name *</Label><Input value={createData.full_name} onChange={(e) => setCreateData({ ...createData, full_name: e.target.value })} /></div>
              <div><Label>Phone (10 digits) *</Label><Input value={createData.phone} onChange={(e) => setCreateData({ ...createData, phone: e.target.value })} maxLength={10} /></div>
              <div><Label>Email</Label><Input value={createData.email} onChange={(e) => setCreateData({ ...createData, email: e.target.value })} /></div>
              <div><Label>Password *</Label><Input type="password" value={createData.password} onChange={(e) => setCreateData({ ...createData, password: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>City</Label><Input value={createData.city} onChange={(e) => setCreateData({ ...createData, city: e.target.value })} /></div>
                <div><Label>State</Label><Input value={createData.state} onChange={(e) => setCreateData({ ...createData, state: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createLoading}>{createLoading ? "Creating..." : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Entity</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Full Name</Label><Input value={editData.full_name || ""} onChange={(e) => setEditData({ ...editData, full_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={editData.email || ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} /></div>
              <div><Label>Status</Label>
                <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSave} disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Wallet Load Dialog */}
        <Dialog open={walletOpen} onOpenChange={setWalletOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Load Wallet</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Amount *</Label><Input type="number" value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} placeholder="Enter amount" /></div>
              <div><Label>Description</Label><Textarea value={walletDesc} onChange={(e) => setWalletDesc(e.target.value)} placeholder="Reason for wallet load..." /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWalletOpen(false)}>Cancel</Button>
              <Button onClick={handleWalletLoad} disabled={walletLoading}>{walletLoading ? "Loading..." : "Load Wallet"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Services Dialog */}
        <Dialog open={servicesOpen} onOpenChange={setServicesOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Service Management</DialogTitle></DialogHeader>
            {servicesLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : servicesData ? (
              <div className="space-y-3">
                {ALL_SERVICES.map((svc) => {
                  const isEnabled = (servicesData.allowed_services || []).includes(svc);
                  return (
                    <div key={svc} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium uppercase text-sm">{svc.replace('_', ' ')}</span>
                      <Button size="sm" variant={isEnabled ? "default" : "outline"} onClick={() => handleToggleService(svc, !isEnabled)}>
                        {isEnabled ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default EntityManagement;
