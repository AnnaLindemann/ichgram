import { Navigate, Outlet } from "react-router-dom";
import { getAuthToken } from "@/lib/auth-storage";

export function PublicOnlyRoute() {
  const token = getAuthToken();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}