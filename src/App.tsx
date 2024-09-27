import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import ContentCenteredDiv from "@/components/ContentCenteredDiv";

export default function App() {
  const { loggedIn, checking } = useAuth();

  if (checking) return <ContentCenteredDiv>Loading...</ContentCenteredDiv>;

  return <Navigate to={loggedIn ? "/home" : "/get-started"} />;
}
