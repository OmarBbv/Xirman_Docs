import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout";
import Register from "../auth/Register";
import Login from "../auth/Login";
import { NotFound } from "../not-found/NotFound";
import HomePage from "../home/HomePage";
import DocumentPage from "../docs/DocumentPage";

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
        element: <HomePage />,
      },
      {
        path: "docs",
        element: <DocumentPage />,
      },
      {
        path: "users",
        element: <div>Users</div>,
      },
      {
        path: "settings",
        element: <div>Settings</div>,
      }
    ],
  },
  {
    path: "*",
    element: <NotFound />
  },
]);