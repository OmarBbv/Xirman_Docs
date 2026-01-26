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
          <ProtectedRole allowedRoles={['admin']}>
            <HomePage />
          </ProtectedRole>
        ),
      },
      {
        path: "docs",
        element: <DocumentPage />,
      },
      {
        path: "docs/year/:year",
        element: <DocumentPage />,
      },
      {
        path: "docs/year/:year/department/:department",
        element: <DocumentPage />,
      },
      {
        path: "docs/year/:year/department/:department/type/:type",
        element: <DocumentPage />,
      },
      {
        path: "docs/:id",
        element: <DocumentDetailsPage />,
      },
      {
        path: "users",
        element: (
          <ProtectedRole allowedRoles={['admin']}>
            <UserPage />
          </ProtectedRole>
        ),
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "docs/new",
        element: <NewDocsPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      }
    ],
  },
  {
    path: "*",
    element: <NotFound />
  },
]);