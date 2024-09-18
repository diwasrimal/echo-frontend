import ContentCenteredDiv from "@/components/ContentCenteredDiv";
import useAuth from "@/hooks/useAuth";
import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { loggedIn, checking } = useAuth();

  if (checking) return <ContentCenteredDiv>Loading...</ContentCenteredDiv>;
  if (!loggedIn) return <Navigate to="/get-started" />;
  return <>{children}</>;
}
