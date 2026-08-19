import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRoleProps {
  /** Köhnə üsul — rol adına görə. Mümkün olduqda `permissions` istifadə edin. */
  allowedRoles?: string[];
  /** Sadalananlardan ən azı biri kifayətdir. */
  permissions?: string[];
  children?: ReactNode;
}

export const ProtectedRole = ({
  allowedRoles = [],
  permissions = [],
  children,
}: ProtectedRoleProps) => {
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roleOk = allowedRoles.length === 0 || (user && allowedRoles.includes(user.role));
  const permissionOk = permissions.length === 0 || hasPermission(...permissions);

  if (!roleOk || !permissionOk) {
    // İstifadəçinin icazəsi olan ilk səhifəyə yönləndiririk ki,
    // sonsuz yönləndirmə dövrü yaranmasın.
    const fallback = hasPermission("documents.view")
      ? "/dashboard/docs"
      : hasPermission("dashboard.view")
        ? "/dashboard"
        : "/dashboard/settings";

    return <Navigate to={fallback} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
