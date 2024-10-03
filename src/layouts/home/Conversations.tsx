import ContentCenteredDiv from "@/components/ContentCenteredDiv";
import useChatPartners from "@/hooks/useChatPartners";
import { SERVER_URL } from "@/lib/constants";
import { Message, User } from "@/lib/types";
import { cn, makePayload } from "@/lib/utils";
import { Navigate } from "react-router-dom";
import UserIcon from "@/components/UserIcon";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { fetchChatPartners, fetchUserInfo } from "@/lib/fetchers";
import useWebsocket from "@/hooks/useWebsocket";
import useAuth from "@/hooks/useAuth";

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
  const {
    partners,
    loading,
    activePartner: activeChatPartner,
    setActivePartner: setActiveChatPartner,
  } = useChatPartners();
  // const { partner: activeChatPartner, setPartner: setActiveChatPartner } =
  //   useOpenedChat();

  // const { userId: ourId } = useAuth();
  // const { data: wsData } = useWebsocket();

  // // Fetches chat partners from server during first run, and from session storage afterwards
  // useEffect(() => {
  //   setLoading(true);
  //   fetchChatPartners()
  //     .then(setPartners)
  //     .catch(console.error)
  //     .finally(() => setLoading(false));
  // }, []);

  // // Update partners list when message is received
  // useEffect(() => {
  //   if (wsData === null) return;
  //   if (wsData.msgType === "chatMsgReceive") {
  //     const msg = wsData.msgData as Message;
  //     const newPartnerId =
  //       msg.senderId === ourId ? msg.receiverId : msg.senderId;
  //     fetchUserInfo(newPartnerId)
  //       .then((user) => {
  //         const newList = [
  //           user,
  //           ...partners.filter((p) => p.id !== newPartnerId),
  //         ];
  //         setPartners(newList);
  //         sessionStorage.setItem(`chatPartners`, JSON.stringify(newList));
  //       })
  //       .catch(console.error);
  //   }
  // }, [wsData]);

  // if (unauthorized) return <Navigate to="/get-started" />;
  if (loading) {
    return (
      <ContentCenteredDiv className="gap-2 ">
        <LoadingSpinner /> Loading...
      </ContentCenteredDiv>
    );
  }

  return (
    <ul className="flex-grow overflow-auto w-full px-2 py-4 flex flex-col gap-2">
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
