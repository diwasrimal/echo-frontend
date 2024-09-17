import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Logout() {
  // const [navigate, setNavigate] = useState(false);
  // const { setLoggedIn, setUserId, checking, loggedIn, userId, setJwt, jwt } =
  // useAuth();
  const { setLoggedIn, setUserId } = useAuth();

  // Reset all states and clear storage
  useEffect(() => {
    // const id = setTimeout(() => setNavigate(true), 2000);

    // console.log(
    //   `AuthContext during logout: checking: ${checking}, loggedIn: ${loggedIn}, userId: ${userId}, jwt: ${jwt}`,
    // );
    localStorage.clear();
    sessionStorage.clear();
    setLoggedIn(false);
    setUserId(-1);
    // setJwt("");

    // return () => clearTimeout(id);
  }, []);

  // if (navigate) {
  return <Navigate to="/get-started" />;
  // } else {
  //   return <div>Logging out...</div>;
  // }
}
