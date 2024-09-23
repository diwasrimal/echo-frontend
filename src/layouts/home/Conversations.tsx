import ContentCenteredDiv from "@/components/ContentCenteredDiv";
import useOpenedChat from "@/hooks/useOpenedChat";
import { SERVER_URL } from "@/lib/constants";
import { User } from "@/lib/types";
import { cn, fetchWithDelay, makePayload } from "@/lib/utils";
import { Navigate } from "react-router-dom";
import UserIcon from "@/components/UserIcon";
import { useState, useEffect } from "react";
import DummyText from "@/components/DummyText";

export default function Conversations() {
  return (
    <div className="overflow-auto h-full flex flex-col">
      <div className="flex-shrink-0 h-[60px] flex items-center justify-center border-b p-2">
        <h1 className="text-xl font-bold">Conversations</h1>
      </div>
      <ChatPartnersList />
    </div>
  );
}

function ChatPartnersList() {
  const [partners, setPartners] = useState<User[]>([]);
  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const { partner: activeChatPartner, setPartner: setActiveChatPartner } =
    useOpenedChat();

  useEffect(() => {
    setLoading(true);
    const url = `${SERVER_URL}/api/chat-partners`;
    fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        console.log(`Payload for ${url}:`, payload);
        if (payload.ok) {
          setPartners(payload.partners || []);
        } else {
          setUnauthorized(payload.status === 401);
          throw new Error(payload.message || "Unknown error");
        }
      })
      .catch((err) => console.log(`Error fetching ${url}: ${err}`))
      .finally(() => setLoading(false));
  }, []);

  if (unauthorized) return <Navigate to="/get-started" />;
  if (loading) return <ContentCenteredDiv>Loading...</ContentCenteredDiv>;

  return (
    <ul className="flex-grow overflow-scroll w-full px-2 py-4 flex flex-col gap-2">
      {partners.map((partner) => {
        const isActive = partner.id === activeChatPartner?.id;
        return (
          <li
            key={partner.id}
            className={cn(
              "p-4 flex items-center gap-2 hover:bg-secondary cursor-pointer border rounded-md transition-colors",
              isActive ? "bg-secondary" : "",
            )}
            onClick={() => setActiveChatPartner(partner)}
          >
            <div>
              <UserIcon
                user={partner}
                className={isActive ? "bg-background" : "bg-secondary"}
              />
            </div>
            <div className="flex-grow">{partner.fullname}</div>
          </li>
        );
      })}
    </ul>
  );
}
