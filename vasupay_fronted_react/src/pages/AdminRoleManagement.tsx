import { DashboardLayout } from "@/components/DashboardLayout";
import { LayoutDashboard, Users, Wallet, Activity, Settings, FileText, Shield, Database, UserCog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

const AdminSidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin" },
    { icon: Users, label: "Partners", path: "/admin/partners" },
    { icon: Users, label: "Users & KYC", path: "/admin/users" },
    { icon: UserCog, label: "Role Management", path: "/admin/roles" },
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

type UserWithRole = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "admin" | "partner" | "user" | null;
  role_id: string | null;
};

const AdminRoleManagement = () => {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all users with their roles
  const { data: users, isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = profiles.map((profile) => {
        const userRole = userRoles.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          role: userRole?.role as "admin" | "partner" | "user" | null,
          role_id: userRole?.id || null,
        };
      });

      return usersWithRoles;
    },
  });

  // Mutation to update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole, roleId }: { userId: string; newRole: "admin" | "partner" | "user"; roleId: string | null }) => {
      if (roleId) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("id", roleId);
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast.success("User role updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user role");
    },
  });

  const handleRoleChange = (userId: string, newRole: "admin" | "partner" | "user", roleId: string | null) => {
    updateRoleMutation.mutate({ userId, newRole, roleId });
  };

  const filteredUsers = users?.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
  );

  if (userRole !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Role Management" userRole="Admin">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>User Role Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => setSearchTerm("")}>Clear</Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "destructive"
                            : user.role === "partner"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {user.role || "No Role"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role || "user"}
                        onValueChange={(value: "admin" | "partner" | "user") =>
                          handleRoleChange(user.id, value, user.role_id)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminRoleManagement;
