import { SERVER_URL } from "@/lib/constants";
import { makePayload } from "@/lib/utils";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthContextType = {
  checking: boolean;
  loggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
  userId: number;
  setUserId: (id: number) => void;
  // jwt: string;
  // setJwt: React.Dispatch<React.SetStateAction<string>>;
};

const def: AuthContextType = {
  checking: true,
  loggedIn: false,
  setLoggedIn: () => {},
  userId: -1,
  setUserId: () => {},
  // jwt: "",
  // setJwt: () => {},
};

export const AuthContext = createContext<AuthContextType>(def);

export default function AuthProvider({ children }: PropsWithChildren) {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(def.loggedIn);
  const [userId, setUserId] = useState(def.userId);
  // const [jwt, setJwt] = useState(localStorage.getItem("jwt") || "");

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");

    if (!jwt) {
      setChecking(false);
      return;
    }

    const url = `${SERVER_URL}/api/auth`;
    fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        if (payload.ok) {
          setLoggedIn(true);
          setUserId(payload.userId);
        } else {
          localStorage.clear(); // jwt was invalid or expired, we clear other data (since they are also invalid now)
          throw new Error(
            `Authorization check failed: ${payload.message || "Unknown error"}`,
          );
        }
      })
      .catch((err) => console.log(`Error fetching ${url}: ${err}`))
      .finally(() => setChecking(false));
  }, []);

  // Store jwt to localstorage when set
  // useEffect(() => localStorage.setItem("jwt", jwt), [jwt]);

  return (
    <AuthContext.Provider
      value={{
        checking,
        loggedIn,
        setLoggedIn,
        userId,
        setUserId,
        // jwt,
        // setJwt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
