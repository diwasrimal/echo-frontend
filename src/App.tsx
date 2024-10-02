import useAuth from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  const { loggedIn, checking } = useAuth();

  if (checking) return <LoadingScreen />;

  return <Navigate to={loggedIn ? "/home" : "/get-started"} />;
}
