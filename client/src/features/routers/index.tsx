import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout";
import Register from "../auth/Register";
import Login from "../auth/Login";
import { NotFound } from "../not-found/NotFound";
import HomePage from "../home/HomePage";
import DocumentPage from "../docs/DocumentPage";
import UserPage from "../user/UserPage";
import SettingsPage from "../settings/SettingsPage";
import { ProtectedRole } from "../utils/ProtectedRole";

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
          <ProtectedRole allowedRoles={[]}>
            <HomePage />
          </ProtectedRole>
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
      }
    ],
  },
  {
    path: "*",
    element: <NotFound />
  },
]);