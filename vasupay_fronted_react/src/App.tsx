import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPartners from "./pages/AdminPartners";
import AdminUsers from "./pages/AdminUsers";
import AdminWallets from "./pages/AdminWallets";
import AdminTransactions from "./pages/AdminTransactions";
import AdminKYC from "./pages/AdminKYC";
import AdminSettlements from "./pages/AdminSettlements";
import AdminCommissions from "./pages/AdminCommissions";
import AdminTickets from "./pages/AdminTickets";
import AdminLogs from "./pages/AdminLogs";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import AdminBBPS from "./pages/AdminBBPS";
import AdminAgentRegistration from "./pages/AdminAgentRegistration";
import AdminSecurity from "./pages/AdminSecurity";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import PartnerDashboard from "./pages/PartnerDashboard";
import PartnerWallet from "./pages/PartnerWallet";
import PartnerServices from "./pages/PartnerServices";
import PartnerAgents from "./pages/PartnerAgents";
import PartnerTransactions from "./pages/PartnerTransactions";
import PartnerReports from "./pages/PartnerReports";
import PartnerSettings from "./pages/PartnerSettings";
import UserDashboard from "./pages/UserDashboard";
import UserWallet from "./pages/UserWallet";
import UserBills from "./pages/UserBills";
import UserTransactions from "./pages/UserTransactions";
import UserRewards from "./pages/UserRewards";
import UserSettings from "./pages/UserSettings";
import UserProfile from "./pages/UserProfile";
import AdminRoleManagement from "./pages/AdminRoleManagement";
import AgentDashboard from "./pages/AgentDashboard";
import AgentBBPS from "./pages/AgentBBPS";
import AgentCustomers from "./pages/AgentCustomers";
import AgentTransactions from "./pages/AgentTransactions";
import AgentReports from "./pages/AgentReports";
import AgentSettings from "./pages/AgentSettings";
import EntityDashboard from "./pages/EntityDashboard";
import EntityManagement from "./pages/EntityManagement";
import EntityKYC from "./pages/EntityKYC";
import EntityWallet from "./pages/EntityWallet";
import EntityTransactions from "./pages/EntityTransactions";
import EntityCommissions from "./pages/EntityCommissions";
import EntitySettlements from "./pages/EntitySettlements";
import EntityServices from "./pages/EntityServices";
import EntitySettings from "./pages/EntitySettings";
import EntityKYCSubmit from "./pages/EntityKYCSubmit";
import SeedTestAccounts from "./pages/SeedTestAccounts";
import NotFound from "./pages/NotFound";
import ScrollToTopButton from './components/ScrollToTopButton';
import ScrollToTop from './components/ScrollToTop';
import Privacy from "./pages/privacy";
import RefundPolicy from "./pages/RefundPolicy"
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
   
      <BrowserRouter>
        <ScrollToTopButton/>
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/seed-accounts" element={<SeedTestAccounts />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/partners" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPartners /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={["admin"]}><AdminRoleManagement /></ProtectedRoute>} />
          <Route path="/admin/wallets" element={<ProtectedRoute allowedRoles={["admin"]}><AdminWallets /></ProtectedRoute>} />
          <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTransactions /></ProtectedRoute>} />
          <Route path="/admin/kyc" element={<ProtectedRoute allowedRoles={["admin"]}><AdminKYC /></ProtectedRoute>} />
          <Route path="/admin/settlements" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettlements /></ProtectedRoute>} />
          <Route path="/admin/commissions" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCommissions /></ProtectedRoute>} />
          <Route path="/admin/tickets" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTickets /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLogs /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAuditLogs /></ProtectedRoute>} />
          <Route path="/admin/bbps" element={<ProtectedRoute allowedRoles={["admin"]}><AdminBBPS /></ProtectedRoute>} />
          <Route path="/admin/agent-registration" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAgentRegistration /></ProtectedRoute>} />
          <Route path="/admin/security" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSecurity /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>} />
          
          {/* Partner Routes (hierarchy-enabled) */}
          <Route path="/partner" element={<ProtectedRoute allowedRoles={["partner"]}><EntityDashboard /></ProtectedRoute>} />
          <Route path="/partner/entities" element={<ProtectedRoute allowedRoles={["partner"]}><EntityManagement /></ProtectedRoute>} />
          <Route path="/partner/kyc" element={<ProtectedRoute allowedRoles={["partner"]}><EntityKYC /></ProtectedRoute>} />
          <Route path="/partner/wallet" element={<ProtectedRoute allowedRoles={["partner"]}><EntityWallet /></ProtectedRoute>} />
          <Route path="/partner/transactions" element={<ProtectedRoute allowedRoles={["partner"]}><EntityTransactions /></ProtectedRoute>} />
          <Route path="/partner/commissions" element={<ProtectedRoute allowedRoles={["partner"]}><EntityCommissions /></ProtectedRoute>} />
          <Route path="/partner/settlements" element={<ProtectedRoute allowedRoles={["partner"]}><EntitySettlements /></ProtectedRoute>} />
          <Route path="/partner/services" element={<ProtectedRoute allowedRoles={["partner"]}><EntityServices /></ProtectedRoute>} />
          <Route path="/partner/settings" element={<ProtectedRoute allowedRoles={["partner"]}><EntitySettings /></ProtectedRoute>} />
          <Route path="/partner/kyc-submit" element={<ProtectedRoute allowedRoles={["partner"]}><EntityKYCSubmit /></ProtectedRoute>} />
          {/* Legacy partner routes for backward compatibility */}
          <Route path="/partner/agents" element={<ProtectedRoute allowedRoles={["partner"]}><PartnerAgents /></ProtectedRoute>} />
          <Route path="/partner/reports" element={<ProtectedRoute allowedRoles={["partner"]}><PartnerReports /></ProtectedRoute>} />
          
          {/* Agent Routes */}
          <Route path="/agent" element={<ProtectedRoute allowedRoles={["agent"]}><AgentDashboard /></ProtectedRoute>} />
          <Route path="/agent/bbps" element={<ProtectedRoute allowedRoles={["agent"]}><AgentBBPS /></ProtectedRoute>} />
          <Route path="/agent/customers" element={<ProtectedRoute allowedRoles={["agent"]}><AgentCustomers /></ProtectedRoute>} />
          <Route path="/agent/transactions" element={<ProtectedRoute allowedRoles={["agent"]}><AgentTransactions /></ProtectedRoute>} />
          <Route path="/agent/reports" element={<ProtectedRoute allowedRoles={["agent"]}><AgentReports /></ProtectedRoute>} />
          <Route path="/agent/settings" element={<ProtectedRoute allowedRoles={["agent"]}><AgentSettings /></ProtectedRoute>} />
          
          {/* User Routes */}
          <Route path="/user" element={<ProtectedRoute allowedRoles={["user"]}><UserDashboard /></ProtectedRoute>} />
          <Route path="/user/wallet" element={<ProtectedRoute allowedRoles={["user"]}><UserWallet /></ProtectedRoute>} />
          <Route path="/user/bills" element={<ProtectedRoute allowedRoles={["user"]}><UserBills /></ProtectedRoute>} />
          <Route path="/user/transactions" element={<ProtectedRoute allowedRoles={["user"]}><UserTransactions /></ProtectedRoute>} />
          <Route path="/user/rewards" element={<ProtectedRoute allowedRoles={["user"]}><UserRewards /></ProtectedRoute>} />
          <Route path="/user/settings" element={<ProtectedRoute allowedRoles={["user"]}><UserSettings /></ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute allowedRoles={["user"]}><UserProfile /></ProtectedRoute>} />
          
          {/* White Label Routes */}
          <Route path="/white-label" element={<ProtectedRoute allowedRoles={["white_label"]}><EntityDashboard /></ProtectedRoute>} />
          <Route path="/white-label/entities" element={<ProtectedRoute allowedRoles={["white_label"]}><EntityManagement /></ProtectedRoute>} />
          <Route path="/white-label/kyc" element={<ProtectedRoute allowedRoles={["white_label"]}><EntityKYC /></ProtectedRoute>} />
          <Route path="/white-label/wallet" element={<ProtectedRoute allowedRoles={["white_label"]}><EntityWallet /></ProtectedRoute>} />
          <Route path="/white-label/transactions" element={<ProtectedRoute allowedRoles={["white_label"]}><EntityTransactions /></ProtectedRoute>} />
          <Route path="/white-label/commissions" element={<ProtectedRoute allowedRoles={["white_label"]}><EntityCommissions /></ProtectedRoute>} />
          <Route path="/white-label/settlements" element={<ProtectedRoute allowedRoles={["white_label"]}><EntitySettlements /></ProtectedRoute>} />
          <Route path="/white-label/services" element={<ProtectedRoute allowedRoles={["white_label"]}><EntityServices /></ProtectedRoute>} />
          <Route path="/white-label/settings" element={<ProtectedRoute allowedRoles={["white_label"]}><EntitySettings /></ProtectedRoute>} />
          <Route path="/white-label/kyc-submit" element={<ProtectedRoute allowedRoles={["white_label"]}><EntityKYCSubmit /></ProtectedRoute>} />

          {/* Agency Routes */}
          <Route path="/agency" element={<ProtectedRoute allowedRoles={["agency"]}><EntityDashboard /></ProtectedRoute>} />
          <Route path="/agency/entities" element={<ProtectedRoute allowedRoles={["agency"]}><EntityManagement /></ProtectedRoute>} />
          <Route path="/agency/kyc" element={<ProtectedRoute allowedRoles={["agency"]}><EntityKYC /></ProtectedRoute>} />
          <Route path="/agency/wallet" element={<ProtectedRoute allowedRoles={["agency"]}><EntityWallet /></ProtectedRoute>} />
          <Route path="/agency/transactions" element={<ProtectedRoute allowedRoles={["agency"]}><EntityTransactions /></ProtectedRoute>} />
          <Route path="/agency/commissions" element={<ProtectedRoute allowedRoles={["agency"]}><EntityCommissions /></ProtectedRoute>} />
          <Route path="/agency/settlements" element={<ProtectedRoute allowedRoles={["agency"]}><EntitySettlements /></ProtectedRoute>} />
          <Route path="/agency/services" element={<ProtectedRoute allowedRoles={["agency"]}><EntityServices /></ProtectedRoute>} />
          <Route path="/agency/settings" element={<ProtectedRoute allowedRoles={["agency"]}><EntitySettings /></ProtectedRoute>} />
          <Route path="/agency/kyc-submit" element={<ProtectedRoute allowedRoles={["agency"]}><EntityKYCSubmit /></ProtectedRoute>} />

          {/* Distributor Routes */}
          <Route path="/distributor" element={<ProtectedRoute allowedRoles={["distributor"]}><EntityDashboard /></ProtectedRoute>} />
          <Route path="/distributor/entities" element={<ProtectedRoute allowedRoles={["distributor"]}><EntityManagement /></ProtectedRoute>} />
          <Route path="/distributor/kyc" element={<ProtectedRoute allowedRoles={["distributor"]}><EntityKYC /></ProtectedRoute>} />
          <Route path="/distributor/wallet" element={<ProtectedRoute allowedRoles={["distributor"]}><EntityWallet /></ProtectedRoute>} />
          <Route path="/distributor/transactions" element={<ProtectedRoute allowedRoles={["distributor"]}><EntityTransactions /></ProtectedRoute>} />
          <Route path="/distributor/commissions" element={<ProtectedRoute allowedRoles={["distributor"]}><EntityCommissions /></ProtectedRoute>} />
          <Route path="/distributor/settlements" element={<ProtectedRoute allowedRoles={["distributor"]}><EntitySettlements /></ProtectedRoute>} />
          <Route path="/distributor/services" element={<ProtectedRoute allowedRoles={["distributor"]}><EntityServices /></ProtectedRoute>} />
          <Route path="/distributor/settings" element={<ProtectedRoute allowedRoles={["distributor"]}><EntitySettings /></ProtectedRoute>} />
          <Route path="/distributor/kyc-submit" element={<ProtectedRoute allowedRoles={["distributor"]}><EntityKYCSubmit /></ProtectedRoute>} />

          {/* Retailer Routes (no entity management) */}
          <Route path="/retailer" element={<ProtectedRoute allowedRoles={["retailer"]}><EntityDashboard /></ProtectedRoute>} />
          <Route path="/retailer/wallet" element={<ProtectedRoute allowedRoles={["retailer"]}><EntityWallet /></ProtectedRoute>} />
          <Route path="/retailer/transactions" element={<ProtectedRoute allowedRoles={["retailer"]}><EntityTransactions /></ProtectedRoute>} />
          <Route path="/retailer/commissions" element={<ProtectedRoute allowedRoles={["retailer"]}><EntityCommissions /></ProtectedRoute>} />
          <Route path="/retailer/settlements" element={<ProtectedRoute allowedRoles={["retailer"]}><EntitySettlements /></ProtectedRoute>} />
          <Route path="/retailer/services" element={<ProtectedRoute allowedRoles={["retailer"]}><EntityServices /></ProtectedRoute>} />
          <Route path="/retailer/settings" element={<ProtectedRoute allowedRoles={["retailer"]}><EntitySettings /></ProtectedRoute>} />
          <Route path="/retailer/kyc-submit" element={<ProtectedRoute allowedRoles={["retailer"]}><EntityKYCSubmit /></ProtectedRoute>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>

      
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
