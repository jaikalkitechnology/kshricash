import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, Lock, Unlock, Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { getUsers, getUserDetail, updateUser, createUser, toggleUserLock } from "@/api/adminApi";

const ENTITY_TYPES = ["retailer", "partner", "distributor", "agency", "white_label", "superadmin"];
const STATUS_OPTIONS = ["active", "inactive", "suspended", "blocked"];

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kycFilter, setKycFilter] = useState("");

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({ full_name: "", phone: "", email: "", password: "", entity_type: "retailer" });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => { loadUsers(); }, [page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: 20 };
      if (search) params.search = search;
      if (entityFilter) params.entity_type = entityFilter;
      if (statusFilter) params.status = statusFilter;
      if (kycFilter) params.kyc_status = kycFilter;
      const data = await getUsers(params);
      setUsers(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.detail || "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { setPage(1); loadUsers(); };

  const handleViewDetail = async (userId: number) => {
    try {
      setDetailLoading(true);
      setDetailOpen(true);
      const data = await getUserDetail(userId);
      setDetailUser(data);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load user detail", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEditOpen = (user: any) => {
    setEditData({ id: user.id, full_name: user.full_name, email: user.email, status: user.status, entity_type: user.entity_type, is_active: user.is_active });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    try {
      setEditLoading(true);
      const { id, ...payload } = editData;
      await updateUser(id, payload);
      toast({ title: "Success", description: "User updated successfully" });
      setEditOpen(false);
      loadUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.detail || "Failed to update user", variant: "destructive" });
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setCreateLoading(true);
      await createUser(createData);
      toast({ title: "Success", description: "User created successfully" });
      setCreateOpen(false);
      setCreateData({ full_name: "", phone: "", email: "", password: "", entity_type: "retailer" });
      loadUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.detail || "Failed to create user", variant: "destructive" });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleLock = async (userId: number, currentlyLocked: boolean) => {
    try {
      await toggleUserLock(userId, !currentlyLocked);
      toast({ title: "Success", description: `User ${currentlyLocked ? "unlocked" : "locked"} successfully` });
      loadUsers();
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to toggle lock", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="User Management" userRole="Super Admin">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Input placeholder="Search by name, phone, email..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
              </div>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Entity Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ENTITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={kycFilter} onValueChange={setKycFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="KYC" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All KYC</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}><Search className="h-4 w-4 mr-2" />Search</Button>
              <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add User</Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Users ({total})</CardTitle>
          </CardHeader>
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
                      <TableHead>Entity</TableHead>
                      <TableHead>KYC</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell><Badge variant="secondary">{user.entity_type}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={user.kyc_status === "verified" ? "default" : user.kyc_status === "pending" ? "secondary" : "destructive"}>
                            {user.kyc_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? "default" : "destructive"}>{user.is_active ? "Yes" : "No"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetail(user.id)}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditOpen(user)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleToggleLock(user.id, user.is_locked)}>
                              {user.is_locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Showing page {page} of {pages} ({total} total)</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* User Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>User Detail</DialogTitle></DialogHeader>
            {detailLoading ? (
              <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
            ) : detailUser ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">ID</Label><p className="font-medium">{detailUser.id}</p></div>
                  <div><Label className="text-muted-foreground">UUID</Label><p className="font-medium text-xs">{detailUser.uuid}</p></div>
                  <div><Label className="text-muted-foreground">Name</Label><p className="font-medium">{detailUser.full_name}</p></div>
                  <div><Label className="text-muted-foreground">Phone</Label><p className="font-medium">{detailUser.phone}</p></div>
                  <div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{detailUser.email || "-"}</p></div>
                  <div><Label className="text-muted-foreground">Entity Type</Label><Badge variant="secondary">{detailUser.entity_type}</Badge></div>
                  <div><Label className="text-muted-foreground">Status</Label><Badge variant={detailUser.status === "active" ? "default" : "destructive"}>{detailUser.status}</Badge></div>
                  <div><Label className="text-muted-foreground">KYC Status</Label><Badge variant={detailUser.kyc_status === "verified" ? "default" : detailUser.kyc_status === "pending" ? "secondary" : "destructive"}>{detailUser.kyc_status}</Badge></div>
                  <div><Label className="text-muted-foreground">Created</Label><p className="font-medium">{new Date(detailUser.created_at).toLocaleString()}</p></div>
                  <div><Label className="text-muted-foreground">Last Login</Label><p className="font-medium">{detailUser.last_login ? new Date(detailUser.last_login).toLocaleString() : "Never"}</p></div>
                </div>

                {/* Wallets */}
                {detailUser.wallets && detailUser.wallets.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Wallets</h4>
                    <div className="space-y-2">
                      {detailUser.wallets.map((w: any) => (
                        <div key={w.id} className="flex justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="capitalize">{w.purpose}</span>
                          <span className="font-semibold">₹{Number(w.balance).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Transactions */}
                {detailUser.recent_transactions && detailUser.recent_transactions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Recent Transactions</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailUser.recent_transactions.map((t: any) => (
                          <TableRow key={t.id}>
                            <TableCell>{t.id}</TableCell>
                            <TableCell>{t.service_type}</TableCell>
                            <TableCell>₹{Number(t.amount).toLocaleString()}</TableCell>
                            <TableCell><Badge variant={t.status === "success" ? "default" : "destructive"}>{t.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Full Name</Label><Input value={editData.full_name || ""} onChange={(e) => setEditData({ ...editData, full_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={editData.email || ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} /></div>
              <div><Label>Status</Label>
                <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Entity Type</Label>
                <Select value={editData.entity_type} onValueChange={(v) => setEditData({ ...editData, entity_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ENTITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSave} disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Full Name *</Label><Input value={createData.full_name} onChange={(e) => setCreateData({ ...createData, full_name: e.target.value })} /></div>
              <div><Label>Phone (10 digits) *</Label><Input value={createData.phone} onChange={(e) => setCreateData({ ...createData, phone: e.target.value })} maxLength={10} /></div>
              <div><Label>Email</Label><Input value={createData.email} onChange={(e) => setCreateData({ ...createData, email: e.target.value })} /></div>
              <div><Label>Password *</Label><Input type="password" value={createData.password} onChange={(e) => setCreateData({ ...createData, password: e.target.value })} /></div>
              <div><Label>Entity Type</Label>
                <Select value={createData.entity_type} onValueChange={(v) => setCreateData({ ...createData, entity_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ENTITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createLoading}>{createLoading ? "Creating..." : "Create User"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
