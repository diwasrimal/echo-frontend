import useAuth from "@/hooks/useAuth";
import useWebsocket from "@/hooks/useWebsocket";
import { SERVER_URL } from "@/lib/constants";
import { fetchUserInfo } from "@/lib/fetchers";
import { Message, User } from "@/lib/types";
import { makePayload } from "@/lib/utils";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type ChatPartnersContextType = {
  loading: boolean;
  partners: User[];
  activePartner: User;
  setActivePartner: (partner: User) => void;
};

const def: ChatPartnersContextType = {
  loading: true,
  partners: [],
  activePartner: null,
  setActivePartner: () => {},
};

export const ChatPartnersContext = createContext<ChatPartnersContextType>(def);

// Provides values including list of chat partners, and a active partner
export default function ChatPartnersProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(def.loading);
  const [partners, setPartners] = useState<User[]>(def.partners);
  const [activePartner, setActivePartner] = useState(() => {
    const data = localStorage.getItem("activeChatPartner");
    return data ? (JSON.parse(data) as User) : null;
  });

  const navigate = useNavigate();
  const { data: wsData } = useWebsocket();
  const { userId: ourId } = useAuth();

  useEffect(() => {
    const url = `${SERVER_URL}/api/chat-partners`;
    fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        if (payload.ok) {
          console.log(`Fetched ${url} from server`);
          setPartners(payload.partners || []);
        } else {
          if (payload.status === 401) navigate("/get-started");
          throw payload.message || "Unknown error occurred";
        }
      })
      .catch((err) => console.error(`error fetching ${url}: ${err}`))
      .finally(() => setLoading(false));
  }, []);

  // Update partners list when message is received and put the partner on top
  // Ignore if already on top of list
  useEffect(() => {
    if (wsData === null) return;
    if (wsData.msgType === "chatMsgReceive") {
      const msg = wsData.msgData as Message;
      const newPartnerId =
        msg.senderId === ourId ? msg.receiverId : msg.senderId;
      if (partners.length > 0 && partners[0].id === newPartnerId) {
        return;
      }
      fetchUserInfo(newPartnerId)
        .then((user) => {
          setPartners([user, ...partners.filter((p) => p.id !== newPartnerId)]);
        })
        .catch(console.error);
    }
  }, [wsData]);

  const val = {
    loading,
    partners,
    activePartner,
    setActivePartner: (partner: User) => {
      localStorage.setItem("activeChatPartner", JSON.stringify(partner));
      setActivePartner(partner);
    },
  };

  return (
    <ChatPartnersContext.Provider value={val}>
      {children}
    </ChatPartnersContext.Provider>
  );
}
