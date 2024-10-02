import ContentCenteredDiv from "@/components/ContentCenteredDiv";
import LoadingScreen from "@/components/LoadingScreen";
import useAuth from "@/hooks/useAuth";
import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { loggedIn, checking } = useAuth();

  if (checking) return <LoadingScreen />;
  if (!loggedIn) return <Navigate to="/get-started" />;
  return <>{children}</>;
}
