import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { mockUser as user } from "../auth/mockUser";

interface ProtectedRoleProps {
  allowedRoles: string[];
  children?: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRole = ({ allowedRoles, children, fallback }: ProtectedRoleProps) => {
  // TODO: Gerçek auth mantığı geldiğinde burası AuthContext'ten gelecek
  // Şimdilik test için localStorage veya mock bir veri kullanabiliriz

  // Eger allowedRoles bosdursa ([]), butun giris etmis istifadecilere icaze verilir
  const hasAccess = user.isAuthenticated && (allowedRoles.length === 0 || allowedRoles.includes(user.role));

  if (!hasAccess) {
    // Eğer bu bir 'Route' koruması ise (children yoksa) yönlendir
    if (!children) {
      return <Navigate to="/dashboard" replace />;
    }
    // Eğer bu bir 'UI' koruması ise (buton gizleme gibi) fallback göster veya null dön
    return fallback ? <>{fallback}</> : null;
  }

  // Yetki varsa: Ya Outlet (Route için) ya da children (Bileşen için) dön
  return children ? <>{children}</> : <Outlet />;
};