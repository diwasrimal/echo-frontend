import { PropsWithChildren, createContext, useEffect, useState } from "react";
import User from "../types/User";
import { makePayload } from "../utils/utils";
import { Navigate } from "react-router-dom";

type ChatPartnersContextType = {
    chatPartners: User[];
    setChatPartners: React.Dispatch<React.SetStateAction<User[]>> | undefined;
    errMsg: string;
    loading: boolean;
};

export const ChatPartnersContext = createContext<ChatPartnersContextType>({
    chatPartners: [],
    setChatPartners: undefined,
    errMsg: "",
    loading: true,
});

export function ChatPartnersProvider({ children }: PropsWithChildren) {
    const [chatPartners, setChatPartners] = useState<User[]>([]);
    const [errMsg, setErrMsg] = useState("");
    const [unauthorized, setUnauthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    // Get people logged in user has chatted with
    useEffect(() => {
        fetch("/api/chat-partners", {
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => makePayload(res))
            .then((payload) => {
                if (payload.ok) {
                    setChatPartners(payload.partners || []);
                    console.log(payload.partners);
                } else {
                    setUnauthorized(payload.statusCode === 401);
                    setErrMsg(payload.message);
                }
            })
            .catch((err) =>
                console.error("Error: GET /api/chat-partners:", err),
            )
            .finally(() => setLoading(false));
    }, []);

    if (unauthorized) {
        console.log("Unauthorized response while requesting fro chat partners");
        return <Navigate to="/login" />;
    }

    return (
        <ChatPartnersContext.Provider
            value={{ chatPartners, setChatPartners, errMsg, loading }}
        >
            {children}
        </ChatPartnersContext.Provider>
    );
}
