import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthToken } from "@/lib/auth-storage";

export function ProtectedRoute() {
  const token = getAuthToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}