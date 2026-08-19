import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../features/layout/Layout";
import Register from "../features/auth/Register";
import Login from "../features/auth/Login";
import { NotFound } from "../features/not-found/NotFound";
import HomePage from "../features/home/HomePage";
import DocumentPage from "../features/docs/DocumentPage";
import DocumentDetailsPage from "../features/docs/DocumentDetailsPage";
import UserPage from "../features/user/UserPage";
import SettingsPage from "../features/settings/SettingsPage";
import { ProtectedRole } from "../features/utils/ProtectedRole";
import NewDocsPage from "../features/new-docs/NewDocsPage";
import NotificationsPage from "../features/notifications/NotificationsPage";
import RolesPage from "../features/roles/RolesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: '/register',
    element: <Register onNavigateToLogin={() => window.location.href = '/login'} />
  },
  {
    path: "/dashboard",
    element: <Layout />,
    errorElement: <div>Not Found</div>,
    children: [
      {
        index: true,
        element: (
          <ProtectedRole permissions={['dashboard.view']}>
            <HomePage />
          </ProtectedRole>
        ),
      },
      {
        path: "docs",
        element: (
          <ProtectedRole permissions={['documents.view']}>
            <DocumentPage />
          </ProtectedRole>
        ),
      },
      {
        path: "docs/year/:year",
        element: (
          <ProtectedRole permissions={['documents.view']}>
            <DocumentPage />
          </ProtectedRole>
        ),
      },
      {
        path: "docs/year/:year/department/:department",
        element: (
          <ProtectedRole permissions={['documents.view']}>
            <DocumentPage />
          </ProtectedRole>
        ),
      },
      {
        path: "docs/year/:year/department/:department/type/:type",
        element: (
          <ProtectedRole permissions={['documents.view']}>
            <DocumentPage />
          </ProtectedRole>
        ),
      },
      {
        path: "docs/:id",
        element: (
          <ProtectedRole permissions={['documents.view']}>
            <DocumentDetailsPage />
          </ProtectedRole>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRole permissions={['users.view', 'users.manage']}>
            <UserPage />
          </ProtectedRole>
        ),
      },
      {
        path: "roles",
        element: (
          <ProtectedRole permissions={['roles.view', 'roles.manage']}>
            <RolesPage />
          </ProtectedRole>
        ),
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "docs/new",
        element: (
          <ProtectedRole permissions={['documents.create']}>
            <NewDocsPage />
          </ProtectedRole>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRole permissions={['notifications.view']}>
            <NotificationsPage />
          </ProtectedRole>
        ),
      }
    ],
  },
  {
    path: "*",
    element: <NotFound />
  },
]);