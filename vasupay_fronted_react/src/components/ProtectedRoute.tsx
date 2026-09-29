import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === "admin") return <Navigate to="/admin" replace />;
    if (userRole === "white_label") return <Navigate to="/white-label" replace />;
    if (userRole === "agency") return <Navigate to="/agency" replace />;
    if (userRole === "distributor") return <Navigate to="/distributor" replace />;
    if (userRole === "partner") return <Navigate to="/partner" replace />;
    if (userRole === "retailer") return <Navigate to="/retailer" replace />;
    if (userRole === "agent") return <Navigate to="/agent" replace />;
    return <Navigate to="/user" replace />;
  }

  return <>{children}</>;
};
