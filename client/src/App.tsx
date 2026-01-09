import { RouterProvider } from "react-router-dom";
import { router } from "./features/routers";

export default function App() {
  return <RouterProvider router={router} />;
}