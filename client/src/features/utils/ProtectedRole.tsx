import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRoleProps {
  allowedRoles: string[];
  children?: ReactNode;
}

export const ProtectedRole = ({ allowedRoles, children }: ProtectedRoleProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = allowedRoles.length === 0 || (user && allowedRoles.includes(user.role));

  if (!hasAccess) {
    return <Navigate to="/dashboard/docs" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};