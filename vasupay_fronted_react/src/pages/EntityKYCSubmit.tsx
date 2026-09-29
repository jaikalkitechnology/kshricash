import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import EntitySidebar from "@/components/EntitySidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield, FileCheck, AlertCircle, CheckCircle2, XCircle, Clock, Upload,
  CreditCard, Building2, Camera, FileText, File as FileIcon, X,
} from "lucide-react";
import { getMyKYCStatus, submitMyKYC, resubmitMyKYC } from "@/api/entityApi";

const ENTITY_LABELS: Record<string, string> = {
  white_label: "White Label", agency: "Agency", distributor: "Distributor",
  partner: "Partner", retailer: "Retailer",
};
const ROUTE_BASE: Record<string, string> = {
  white_label: "/white-label", agency: "/agency", distributor: "/distributor",
  partner: "/partner", retailer: "/retailer",
};

const ADDRESS_PROOF_TYPES = [
  { value: "utility_bill", label: "Utility Bill" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "passport", label: "Passport" },
  { value: "driving_license", label: "Driving License" },
  { value: "voter_id", label: "Voter ID" },
];

// Reusable file upload component
const FileUploadField = ({
  label,
  description,
  fieldName,
  existingFile,
  disabled,
  onFileChange,
}: {
  label: string;
  description?: string;
  fieldName: string;
  existingFile?: string | null;
  disabled: boolean;
  onFileChange: (fieldName: string, file: File | null) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    onFileChange(fieldName, file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    onFileChange(fieldName, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleChange}
            disabled={disabled}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer disabled:opacity-50"
          />
        </div>
        {selectedFile && (
          <Button type="button" variant="ghost" size="sm" onClick={clearFile}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {selectedFile && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <FileIcon className="h-3 w-3" /> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
        </p>
      )}
      {!selectedFile && existingFile && (
        <p className="text-xs text-blue-600 flex items-center gap-1">
          <FileCheck className="h-3 w-3" /> Already uploaded: {existingFile.split("/").pop()}
        </p>
      )}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
};

const EntityKYCSubmit = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const entityType = user?.entity_type || "partner";
  const label = ENTITY_LABELS[entityType] || entityType;
  const basePath = ROUTE_BASE[entityType] || "/user";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>("not_submitted");
  const [kycSubmitted, setKycSubmitted] = useState(false);
  const [existingKYC, setExistingKYC] = useState<any>(null);

  // Text fields
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [addressProofType, setAddressProofType] = useState("");
  const [addressProofNumber, setAddressProofNumber] = useState("");

  // File fields - store File objects
  const [files, setFiles] = useState<Record<string, File | null>>({});

  useEffect(() => { loadKYCStatus(); }, []);

  const loadKYCStatus = async () => {
    try {
      setLoading(true);
      const data = await getMyKYCStatus();
      setKycStatus(data.kyc_status || "not_submitted");
      setKycSubmitted(data.kyc_submitted || false);
      if (data.kyc) {
        setExistingKYC(data.kyc);
        setAadhaarNumber(data.kyc.aadhaar_number || "");
        setPanNumber(data.kyc.pan_number || "");
        setAddressProofType(data.kyc.address_proof_type || "");
        setAddressProofNumber(data.kyc.address_proof_number || "");
      }
    } catch {
      toast({ title: "Error", description: "Failed to load KYC status", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (fieldName: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [fieldName]: file }));
  };

  const handleSubmit = async () => {
    // Validate at least one identity doc
    const hasAadhaar = !!aadhaarNumber || !!files.aadhaar_front;
    const hasPan = !!panNumber || !!files.pan_card;
    if (!hasAadhaar && !hasPan) {
      toast({ title: "Required", description: "Please provide at least Aadhaar or PAN details", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();

      // Append text fields
      if (aadhaarNumber) formData.append("aadhaar_number", aadhaarNumber);
      if (panNumber) formData.append("pan_number", panNumber);
      if (addressProofType) formData.append("address_proof_type", addressProofType);
      if (addressProofNumber) formData.append("address_proof_number", addressProofNumber);

      // Append file fields
      const fileFieldMap: Record<string, string> = {
        aadhaar_front: "aadhaar_front",
        aadhaar_back: "aadhaar_back",
        pan_card: "pan_card",
        photo: "photo",
        selfie: "selfie",
        signature: "signature",
        address_proof: "address_proof",
        gst_certificate: "gst_certificate",
        shop_act: "shop_act",
        trade_license: "trade_license",
        cancelled_cheque: "cancelled_cheque",
        bank_statement: "bank_statement",
        rental_agreement: "rental_agreement",
        electricity_bill: "electricity_bill",
      };

      for (const [key, paramName] of Object.entries(fileFieldMap)) {
        if (files[key]) {
          formData.append(paramName, files[key] as File);
        }
      }

      if (kycSubmitted) {
        await resubmitMyKYC(formData);
        toast({ title: "Success", description: "KYC documents resubmitted for approval" });
      } else {
        await submitMyKYC(formData);
        toast({ title: "Success", description: "KYC documents submitted for approval" });
      }

      setFiles({});
      await loadKYCStatus();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to submit KYC";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (s: string) => {
    if (s === "verified") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (s === "rejected") return <XCircle className="h-5 w-5 text-red-500" />;
    if (s === "pending" || s === "under_review" || s === "resubmitted") return <Clock className="h-5 w-5 text-yellow-500" />;
    return <AlertCircle className="h-5 w-5 text-gray-500" />;
  };

  const statusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
    if (s === "verified") return "default";
    if (s === "rejected") return "destructive";
    if (s === "pending" || s === "under_review" || s === "resubmitted") return "secondary";
    return "outline";
  };

  const isEditable = kycStatus !== "verified";
  const showBusinessDocs = ["white_label", "agency", "distributor", "partner", "retailer", "merchant"].includes(entityType);

  return (
    <DashboardLayout sidebar={<EntitySidebar basePath={basePath} canManageChildren={false} />} title="Submit KYC" userRole={label}>
      <div className="space-y-6">
        {/* Status Banner */}
        {loading ? (
          <Skeleton className="h-24 rounded-lg" />
        ) : (
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {statusIcon(kycStatus)}
                  <div>
                    <h3 className="font-semibold text-lg">KYC Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {kycStatus === "verified" && "Your KYC is verified. No changes needed."}
                      {kycStatus === "pending" && "Your KYC is submitted and pending approval."}
                      {kycStatus === "under_review" && "Your KYC is under review."}
                      {kycStatus === "rejected" && "Your KYC was rejected. Please review and resubmit."}
                      {kycStatus === "resubmitted" && "Your KYC has been resubmitted and is pending re-approval."}
                      {(kycStatus === "not_submitted" || kycStatus === "in_progress") && "Please submit your KYC documents below."}
                    </p>
                  </div>
                </div>
                <Badge variant={statusVariant(kycStatus)} className="text-sm px-3 py-1 capitalize">
                  {kycStatus.replace("_", " ")}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejection Alert */}
        {existingKYC?.rejection_reason && kycStatus === "rejected" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>KYC Rejected</AlertTitle>
            <AlertDescription>
              <p className="font-medium">Reason: {existingKYC.rejection_reason}</p>
              {existingKYC.rejection_category && (
                <p className="text-sm mt-1">Category: {existingKYC.rejection_category}</p>
              )}
              {existingKYC.resubmission_count > 0 && (
                <p className="text-sm mt-1">Resubmission #{existingKYC.resubmission_count}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        ) : (
          <Tabs defaultValue="identity" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="identity" className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" /> Identity
              </TabsTrigger>
              <TabsTrigger value="photo" className="flex items-center gap-1">
                <Camera className="h-4 w-4" /> Photo & Selfie
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-1">
                <FileText className="h-4 w-4" /> Address Proof
              </TabsTrigger>
              {showBusinessDocs && (
                <TabsTrigger value="business" className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" /> Business Docs
                </TabsTrigger>
              )}
            </TabsList>

            {/* Identity Documents Tab */}
            <TabsContent value="identity">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Identity Documents</CardTitle>
                  <CardDescription>Upload your Aadhaar and PAN card (at least one required)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Aadhaar */}
                  <div className="space-y-4 p-4 rounded-lg border">
                    <h4 className="font-medium flex items-center gap-2"><CreditCard className="h-4 w-4" /> Aadhaar Card</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Aadhaar Number (last 4 digits)</Label>
                        <Input
                          placeholder="XXXX XXXX 1234"
                          value={aadhaarNumber}
                          onChange={(e) => setAadhaarNumber(e.target.value)}
                          disabled={!isEditable}
                          maxLength={20}
                        />
                      </div>
                      <div /> {/* spacer */}
                      <FileUploadField
                        label="Aadhaar Front"
                        description="Front side of Aadhaar card (JPG, PNG, PDF - max 5MB)"
                        fieldName="aadhaar_front"
                        existingFile={existingKYC?.aadhaar_front_url}
                        disabled={!isEditable}
                        onFileChange={handleFileChange}
                      />
                      <FileUploadField
                        label="Aadhaar Back"
                        description="Back side of Aadhaar card"
                        fieldName="aadhaar_back"
                        existingFile={existingKYC?.aadhaar_back_url}
                        disabled={!isEditable}
                        onFileChange={handleFileChange}
                      />
                    </div>
                  </div>

                  {/* PAN */}
                  <div className="space-y-4 p-4 rounded-lg border">
                    <h4 className="font-medium flex items-center gap-2"><CreditCard className="h-4 w-4" /> PAN Card</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>PAN Number</Label>
                        <Input
                          placeholder="ABCDE1234F"
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                          disabled={!isEditable}
                          maxLength={10}
                        />
                      </div>
                      <FileUploadField
                        label="PAN Card Image"
                        description="Scan or photo of PAN card"
                        fieldName="pan_card"
                        existingFile={existingKYC?.pan_card_url}
                        disabled={!isEditable}
                        onFileChange={handleFileChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Photo & Selfie Tab */}
            <TabsContent value="photo">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" /> Photo & Verification</CardTitle>
                  <CardDescription>Upload your photo, selfie, and signature for identity verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FileUploadField
                      label="Passport Photo"
                      description="Clear passport-size photo"
                      fieldName="photo"
                      existingFile={existingKYC?.photo_url}
                      disabled={!isEditable}
                      onFileChange={handleFileChange}
                    />
                    <FileUploadField
                      label="Live Selfie"
                      description="Recent selfie for face match"
                      fieldName="selfie"
                      existingFile={existingKYC?.selfie_url}
                      disabled={!isEditable}
                      onFileChange={handleFileChange}
                    />
                    <FileUploadField
                      label="Signature"
                      description="Image of your signature"
                      fieldName="signature"
                      existingFile={existingKYC?.signature_url}
                      disabled={!isEditable}
                      onFileChange={handleFileChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Address Proof Tab */}
            <TabsContent value="address">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Address Proof</CardTitle>
                  <CardDescription>Upload address verification document</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Document Type</Label>
                      <Select value={addressProofType} onValueChange={setAddressProofType} disabled={!isEditable}>
                        <SelectTrigger><SelectValue placeholder="Select document type" /></SelectTrigger>
                        <SelectContent>
                          {ADDRESS_PROOF_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Document Number</Label>
                      <Input
                        placeholder="Document number"
                        value={addressProofNumber}
                        onChange={(e) => setAddressProofNumber(e.target.value)}
                        disabled={!isEditable}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FileUploadField
                        label="Address Proof Document"
                        description="Upload scan or photo of address proof"
                        fieldName="address_proof"
                        existingFile={existingKYC?.address_proof_url}
                        disabled={!isEditable}
                        onFileChange={handleFileChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Business Documents Tab */}
            {showBusinessDocs && (
              <TabsContent value="business">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Business Documents</CardTitle>
                    <CardDescription>Business registration and financial documents (optional for some entity types)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FileUploadField
                        label="GST Certificate"
                        fieldName="gst_certificate"
                        existingFile={existingKYC?.gst_certificate_url}
                        disabled={!isEditable}
                        onFileChange={handleFileChange}
                      />
                      <FileUploadField
                        label="Shop Act License"
                        fieldName="shop_act"
                        existingFile={existingKYC?.shop_act_url}
                        disabled={!isEditable}
                        onFileChange={handleFileChange}
                      />
                      <FileUploadField
                        label="Trade License"
                        fieldName="trade_license"
                        existingFile={existingKYC?.trade_license_url}
                        disabled={!isEditable}
                        onFileChange={handleFileChange}
                      />
                      <FileUploadField
                        label="Cancelled Cheque"
                        fieldName="cancelled_cheque"
                        existingFile={existingKYC?.cancelled_cheque_url}
                        disabled={!isEditable}
                        onFileChange={handleFileChange}
                      />
                      <FileUploadField
                        label="Bank Statement"
                        fieldName="bank_statement"
                        existingFile={existingKYC?.bank_statement_url}
                        disabled={!isEditable}
                        onFileChange={handleFileChange}
                      />
                      <FileUploadField
                        label="Rental Agreement"
                        fieldName="rental_agreement"
                        existingFile={existingKYC?.rental_agreement_url}
                        disabled={!isEditable}
                        onFileChange={handleFileChange}
                      />
                      <FileUploadField
                        label="Electricity Bill"
                        fieldName="electricity_bill"
                        existingFile={existingKYC?.electricity_bill_url}
                        disabled={!isEditable}
                        onFileChange={handleFileChange}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        )}

        {/* Submit Button */}
        {isEditable && !loading && (
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              size="lg"
              className="min-w-[200px]"
            >
              {submitting ? (
                <span className="flex items-center gap-2"><Clock className="h-4 w-4 animate-spin" /> Submitting...</span>
              ) : kycSubmitted ? (
                <span className="flex items-center gap-2"><Upload className="h-4 w-4" /> Resubmit KYC</span>
              ) : (
                <span className="flex items-center gap-2"><FileCheck className="h-4 w-4" /> Submit KYC</span>
              )}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EntityKYCSubmit;
