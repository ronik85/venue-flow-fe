import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

/** Redirects authenticated users away from auth pages (login/register) back to home */
export default function GuestRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  if (loading) return null;
  if (user) return <Navigate to={from} replace />;
  return <>{children}</>;
}
