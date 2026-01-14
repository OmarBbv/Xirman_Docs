import { RouterProvider } from "react-router-dom";
import { router } from "./routers";
import { LanguageProvider } from "./context/LanguageContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./features/utils/queryClient";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}