import ContentCenteredDiv from "@/components/ContentCenteredDiv";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import MessageInputBox from "@/components/MessageInputBox";
import UserIcon from "@/components/UserIcon";
import useAuth from "@/hooks/useAuth";
import useChatPartners from "@/hooks/useChatPartners";
import useWebsocket from "@/hooks/useWebsocket";
import { fetchChatMessages } from "@/lib/fetchers";
import { Message, User } from "@/lib/types";
import { cn, formatChatDate } from "@/lib/utils";
import { EllipsisVertical, Phone, Video } from "lucide-react";
import { useEffect, useState } from "react";

export default function ChatArea() {
  const { activePartner: chatPartner } = useChatPartners();

  if (chatPartner === null) {
    return (
      <div className="h-full flex justify-center items-center">
        <h2 className="text-xl">No chat selected!</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Top title */}
      <div className="flex-shrink-0 h-[60px] border-b flex justify-between items-center px-4">
        <div className="flex gap-2 justify-center items-center">
          <UserIcon user={chatPartner} />
          <div className="font-bold text-lg">{chatPartner.fullname}</div>
        </div>
        <div className="flex gap-4 items-center justify-center">
          <Phone className="cursor-pointer" />
          <Video className="cursor-pointer" />
          <EllipsisVertical className="cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-auto">
        <ChatMessages partner={chatPartner} />
      </div>

      {/* Input area */}
      <div className="py-2 px-4 border-t">
        <MessageInputBox key={chatPartner.id} partner={chatPartner} />
      </div>
    </div>
  );
}

function ChatMessages({ partner }: { partner: User }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [fetching, setFetching] = useState(true);
  const { userId: ourId } = useAuth();

  const { data: wsData } = useWebsocket();

  useEffect(() => {
    setFetching(true);
    fetchChatMessages(ourId, partner.id)
      .then(setMessages)
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [partner]);

  // Update messages state and sessionStorage when message is recieved via ws
  useEffect(() => {
    if (wsData === null) return;
    if (wsData.msgType === "chatMsgReceive") {
      const msg = wsData.msgData as Message;
      console.log("receireved message", msg);
      const msgInvolvesCurrPartner =
        partner.id === msg.receiverId || partner.id === msg.senderId;

      // If message recieved involves currently active chat partner, then we have
      // to also update the state of rendered messages
      // Else if the message involves some other user, that's not currenlty active, then
      // we can just store the message to sessionStorage which can be retreived later
      if (msgInvolvesCurrPartner) {
        const newList = [msg, ...messages];
        setMessages(newList);
        sessionStorage.setItem(
          `messages-${partner.id}`,
          JSON.stringify(newList),
        );
      } else {
        const otherPartnerId =
          msg.senderId === ourId ? msg.receiverId : msg.senderId;

        fetchChatMessages(ourId, otherPartnerId)
          .then((prevMsgs) => {
            const msgInPrevMsgs =
              prevMsgs.length > 0 && prevMsgs[0].id === msg.id;
            const newList = msgInPrevMsgs ? prevMsgs : [msg, ...prevMsgs];
            sessionStorage.setItem(
              `messages-${otherPartnerId}`,
              JSON.stringify(newList),
            );
            console.log("Saving", newList, "to sessionstorage");
          })
          .catch(console.error);
      }
    }
  }, [wsData]);

  if (fetching) {
    return (
      <ContentCenteredDiv className="gap-2 ">
        <LoadingSpinner /> Loading...
      </ContentCenteredDiv>
    );
  }

  if (messages.length === 0) {
    return <ContentCenteredDiv>No messages!</ContentCenteredDiv>;
  }

  return (
    <div className="h-full flex flex-col-reverse overflow-auto gap-1 p-2">
      {messages.map((msg, i) => {
        const showMsgTime = i > 0 && msg.senderId !== messages[i - 1].senderId;
        const msgTime = formatChatDate(msg.timestamp);
        return (
          <div className="flex flex-col gap-1" key={msg.id}>
            <div
              className={cn(
                "py-1 px-3 flex max-w-[60%] items-center rounded-lg text-[0.9rem]",
                msg.senderId === ourId
                  ? "border items-end self-end bg-primary text-primary-foreground"
                  : "bg-secondary items-start self-start",
              )}
              title={`${msg.senderId === ourId ? "Sent" : "Received"} on ${msgTime} `}
            >
              {msg.text}
            </div>
            {showMsgTime && (
              <div
                className={cn(
                  "text-xs text-muted-foreground flex px-1 mb-2",
                  msg.senderId === ourId ? "self-end" : "self-start",
                )}
              >
                {msgTime}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
