import { createBrowserRouter } from "react-router-dom";
import Layout from "../features/layout/Layout";
import Register from "../features/auth/Register";
import Login from "../features/auth/Login";
import { NotFound } from "../features/not-found/NotFound";
import HomePage from "../features/home/HomePage";
import DocumentPage from "../features/docs/DocumentPage";
import UserPage from "../features/user/UserPage";
import SettingsPage from "../features/settings/SettingsPage";
// import { ProtectedRole } from "../features/utils/ProtectedRole";
import NewDocsPage from "../features/new-docs/NewDocsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: "/dashboard",
    element: <Layout />,
    errorElement: <div>Not Found</div>,
    children: [
      {
        index: true,
        element: (
          // <ProtectedRole allowedRoles={['admin']}>
          <HomePage />
          // </ProtectedRole>
        ),
      },
      {
        path: "docs",
        element: <DocumentPage />,
      },
      {
        path: "users",
        element: <UserPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "docs/new",
        element: <NewDocsPage />,
      }
    ],
  },
  {
    path: "*",
    element: <NotFound />
  },
]);