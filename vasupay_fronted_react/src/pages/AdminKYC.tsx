import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye, FileText,
  CreditCard, Camera, Building2, User, Clock, Shield, AlertCircle, Download, Loader2,
} from "lucide-react";
import { getKYCSubmissions, getKYCDetail, approveKYC, rejectKYC } from "@/api/adminApi";
import api from "@/api/api";
import { BASE_URL } from "@/config";

// Build API path for KYC documents (relative to BASE_URL)
const getFileApiPath = (path: string | null): string | null => {
  if (!path) return null;
  // path looks like "kyc/123/filename.jpg"
  const parts = path.split("/");
  if (parts.length >= 3) {
    return `/kyc/files/${parts[1]}/${parts[2]}`;
  }
  return null;
};

// Fetch a file through the authenticated axios instance and return a blob URL
const fetchAuthBlob = async (apiPath: string): Promise<string> => {
  const response = await api.get(apiPath, { responseType: "blob" });
  return URL.createObjectURL(response.data);
};

// Component that loads a file with auth and displays it inline
const AuthImage = ({ apiPath, alt }: { apiPath: string; alt: string }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let revoke = "";
    setLoading(true);
    setError(false);
    fetchAuthBlob(apiPath)
      .then((url) => { revoke = url; setBlobUrl(url); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [apiPath]);

  if (loading) return <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>;
  if (error) return <p className="text-xs text-red-500">Failed to load image</p>;
  if (!blobUrl) return null;

  return (
    <a href={blobUrl} target="_blank" rel="noopener noreferrer" className="block">
      <img src={blobUrl} alt={alt} className="max-w-[200px] max-h-[150px] rounded-md border object-cover hover:opacity-80 transition-opacity cursor-pointer" />
    </a>
  );
};

// Reusable document display component
const DocumentField = ({ label, fileUrl, textValue }: { label: string; fileUrl?: string | null; textValue?: string | null }) => {
  const apiPath = fileUrl ? getFileApiPath(fileUrl) : null;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!apiPath) return;
    setDownloading(true);
    try {
      const blobUrl = await fetchAuthBlob(apiPath);
      window.open(blobUrl, "_blank");
      // Revoke after a delay so the new tab has time to load
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      // silent fail
    } finally {
      setDownloading(false);
    }
  }, [apiPath]);

  if (!apiPath && !textValue) return null;

  const isImage = apiPath?.match(/\.(jpg|jpeg|png)$/i);

  return (
    <div className="space-y-1">
      {label && <p className="text-xs text-muted-foreground font-medium">{label}</p>}
      {textValue && <p className="text-sm font-medium">{textValue}</p>}
      {apiPath && (
        <div className="mt-1">
          {isImage ? (
            <AuthImage apiPath={apiPath} alt={label} />
          ) : (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              View Document <Download className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const AdminKYC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState<any>(null);

  // Approve/Reject dialog
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [actionId, setActionId] = useState<number>(0);
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadData(); }, [page, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: 20 };
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      const data = await getKYCSubmissions(params);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast({ title: "Error", description: "Failed to load KYC submissions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (kycId: number) => {
    try {
      setDetailLoading(true);
      setDetailOpen(true);
      const data = await getKYCDetail(kycId);
      setSelectedKYC(data);
    } catch {
      toast({ title: "Error", description: "Failed to load KYC details", variant: "destructive" });
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openAction = (id: number, type: "approve" | "reject") => {
    setActionId(id);
    setActionType(type);
    setRemarks("");
    setActionOpen(true);
  };

  const handleAction = async () => {
    try {
      setActionLoading(true);
      if (actionType === "approve") {
        await approveKYC(actionId, remarks || undefined);
      } else {
        if (!remarks.trim()) {
          toast({ title: "Required", description: "Please provide a rejection reason", variant: "destructive" });
          setActionLoading(false);
          return;
        }
        await rejectKYC(actionId, remarks || undefined);
      }
      toast({ title: "Success", description: `KYC ${actionType}d successfully` });
      setActionOpen(false);
      setDetailOpen(false);
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.detail || `Failed to ${actionType} KYC`, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const statusColor = (s: string): "default" | "secondary" | "destructive" | "outline" => {
    if (s === "verified") return "default";
    if (s === "rejected") return "destructive";
    if (s === "pending" || s === "resubmitted" || s === "under_review") return "secondary";
    return "outline";
  };

  const pendingCount = items.filter(i => i.status === "pending" || i.status === "resubmitted").length;

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="KYC Management" userRole="Super Admin">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full"><Shield className="h-4 w-4 text-blue-600" /></div>
                <div><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{total}</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-full"><Clock className="h-4 w-4 text-yellow-600" /></div>
                <div><p className="text-xs text-muted-foreground">Pending Review</p><p className="text-xl font-bold">{pendingCount}</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>KYC Submissions</CardTitle>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resubmitted">Resubmitted</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                      <TableHead>User</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Aadhaar</TableHead>
                      <TableHead>PAN</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className={item.status === "pending" || item.status === "resubmitted" ? "bg-yellow-50/50 dark:bg-yellow-950/10" : ""}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.user_name}</p>
                            <p className="text-xs text-muted-foreground">{item.user_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{item.entity_type?.replace("_", " ") || "-"}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.aadhaar_number || "-"}</TableCell>
                        <TableCell className="font-mono text-sm">{item.pan_number || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={statusColor(item.status)}>
                            {item.status}
                            {item.resubmission_count > 0 && ` (#${item.resubmission_count})`}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => openDetail(item.id)} title="Review Documents">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {(item.status === "pending" || item.status === "resubmitted") && (
                              <>
                                <Button size="sm" variant="default" onClick={() => openAction(item.id, "approve")} title="Approve">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => openAction(item.id, "reject")} title="Reject">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No KYC submissions found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {page} of {pages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* KYC Detail / Document Review Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> KYC Review {selectedKYC ? `#${selectedKYC.id}` : ""}
              </DialogTitle>
            </DialogHeader>

            {detailLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            ) : selectedKYC ? (
              <div className="space-y-4">
                {/* User Info Bar */}
                <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{selectedKYC.user_name}</p>
                      <p className="text-xs text-muted-foreground">{selectedKYC.user_phone} | {selectedKYC.user_email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">{selectedKYC.entity_type?.replace("_", " ") || "-"}</Badge>
                  <Badge variant={statusColor(selectedKYC.status)}>{selectedKYC.status}</Badge>
                  {selectedKYC.resubmission_count > 0 && (
                    <Badge variant="secondary">Resubmission #{selectedKYC.resubmission_count}</Badge>
                  )}
                </div>

                {/* Rejection Info */}
                {selectedKYC.rejection_reason && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Previous Rejection</p>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">{selectedKYC.rejection_reason}</p>
                  </div>
                )}

                {/* Document Tabs */}
                <Tabs defaultValue="identity" className="space-y-3">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="identity" className="text-xs sm:text-sm"><CreditCard className="h-3 w-3 mr-1" /> Identity</TabsTrigger>
                    <TabsTrigger value="photo" className="text-xs sm:text-sm"><Camera className="h-3 w-3 mr-1" /> Photo</TabsTrigger>
                    <TabsTrigger value="address" className="text-xs sm:text-sm"><FileText className="h-3 w-3 mr-1" /> Address</TabsTrigger>
                    <TabsTrigger value="business" className="text-xs sm:text-sm"><Building2 className="h-3 w-3 mr-1" /> Business</TabsTrigger>
                  </TabsList>

                  <TabsContent value="identity">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4 p-3 border rounded-lg">
                            <h4 className="font-medium text-sm flex items-center gap-1"><CreditCard className="h-4 w-4" /> Aadhaar Card</h4>
                            <DocumentField label="Aadhaar Number" textValue={selectedKYC.aadhaar_number} />
                            <DocumentField label="Aadhaar Front" fileUrl={selectedKYC.aadhaar_front_url} />
                            <DocumentField label="Aadhaar Back" fileUrl={selectedKYC.aadhaar_back_url} />
                            {!selectedKYC.aadhaar_number && !selectedKYC.aadhaar_front_url && (
                              <p className="text-xs text-muted-foreground italic">Not provided</p>
                            )}
                          </div>
                          <div className="space-y-4 p-3 border rounded-lg">
                            <h4 className="font-medium text-sm flex items-center gap-1"><CreditCard className="h-4 w-4" /> PAN Card</h4>
                            <DocumentField label="PAN Number" textValue={selectedKYC.pan_number} />
                            <DocumentField label="PAN Card Image" fileUrl={selectedKYC.pan_card_url} />
                            {!selectedKYC.pan_number && !selectedKYC.pan_card_url && (
                              <p className="text-xs text-muted-foreground italic">Not provided</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="photo">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2 p-3 border rounded-lg">
                            <h4 className="font-medium text-sm">Passport Photo</h4>
                            <DocumentField label="" fileUrl={selectedKYC.photo_url} />
                            {!selectedKYC.photo_url && <p className="text-xs text-muted-foreground italic">Not provided</p>}
                          </div>
                          <div className="space-y-2 p-3 border rounded-lg">
                            <h4 className="font-medium text-sm">Live Selfie</h4>
                            <DocumentField label="" fileUrl={selectedKYC.selfie_url} />
                            {!selectedKYC.selfie_url && <p className="text-xs text-muted-foreground italic">Not provided</p>}
                          </div>
                          <div className="space-y-2 p-3 border rounded-lg">
                            <h4 className="font-medium text-sm">Signature</h4>
                            <DocumentField label="" fileUrl={selectedKYC.signature_url} />
                            {!selectedKYC.signature_url && <p className="text-xs text-muted-foreground italic">Not provided</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="address">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <DocumentField label="Document Type" textValue={selectedKYC.address_proof_type?.replace("_", " ")} />
                          <DocumentField label="Document Number" textValue={selectedKYC.address_proof_number} />
                          <div className="md:col-span-2">
                            <DocumentField label="Address Proof Document" fileUrl={selectedKYC.address_proof_url} />
                          </div>
                        </div>
                        {!selectedKYC.address_proof_type && !selectedKYC.address_proof_url && (
                          <p className="text-xs text-muted-foreground italic mt-2">No address proof provided</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="business">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <DocumentField label="GST Certificate" fileUrl={selectedKYC.gst_certificate_url} />
                          <DocumentField label="Shop Act License" fileUrl={selectedKYC.shop_act_url} />
                          <DocumentField label="Trade License" fileUrl={selectedKYC.trade_license_url} />
                          <DocumentField label="Cancelled Cheque" fileUrl={selectedKYC.cancelled_cheque_url} />
                          <DocumentField label="Bank Statement" fileUrl={selectedKYC.bank_statement_url} />
                          <DocumentField label="Rental Agreement" fileUrl={selectedKYC.rental_agreement_url} />
                          <DocumentField label="Electricity Bill" fileUrl={selectedKYC.electricity_bill_url} />
                        </div>
                        {!selectedKYC.gst_certificate_url && !selectedKYC.shop_act_url && !selectedKYC.trade_license_url &&
                         !selectedKYC.cancelled_cheque_url && !selectedKYC.bank_statement_url && (
                          <p className="text-xs text-muted-foreground italic mt-2">No business documents provided</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-3">
                  <span>Submitted: {selectedKYC.submitted_at ? new Date(selectedKYC.submitted_at).toLocaleString() : "-"}</span>
                  {selectedKYC.verified_at && <span>Verified: {new Date(selectedKYC.verified_at).toLocaleString()}</span>}
                  {selectedKYC.verified_by && <span>Verified by: Admin #{selectedKYC.verified_by}</span>}
                  {selectedKYC.verification_notes && <span>Notes: {selectedKYC.verification_notes}</span>}
                </div>

                {/* Action Buttons inside detail dialog */}
                {(selectedKYC.status === "pending" || selectedKYC.status === "resubmitted") && (
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="destructive" onClick={() => { setDetailOpen(false); openAction(selectedKYC.id, "reject"); }}>
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button variant="default" onClick={() => { setDetailOpen(false); openAction(selectedKYC.id, "approve"); }}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  </DialogFooter>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Approve/Reject Action Dialog */}
        <Dialog open={actionOpen} onOpenChange={setActionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {actionType === "approve" ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                {actionType === "approve" ? "Approve" : "Reject"} KYC #{actionId}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{actionType === "reject" ? "Rejection Reason *" : "Remarks (optional)"}</Label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={actionType === "reject" ? "Provide reason for rejection..." : "Optional remarks..."}
                  rows={3}
                />
                {actionType === "reject" && !remarks.trim() && (
                  <p className="text-xs text-red-500 mt-1">Rejection reason is required</p>
                )}
              </div>
              {actionType === "approve" && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-sm text-green-700 dark:text-green-300">
                  This will set the user's KYC status to <strong>verified</strong> and allow them to perform transactions.
                </div>
              )}
              {actionType === "reject" && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-sm text-red-700 dark:text-red-300">
                  The user will be notified of the rejection and can resubmit their documents.
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionOpen(false)}>Cancel</Button>
              <Button
                variant={actionType === "approve" ? "default" : "destructive"}
                onClick={handleAction}
                disabled={actionLoading || (actionType === "reject" && !remarks.trim())}
              >
                {actionLoading ? "Processing..." : actionType === "approve" ? "Confirm Approve" : "Confirm Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminKYC;
