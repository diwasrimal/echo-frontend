import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useAutosizeTextArea from "@/hooks/useAutosizeTextArea";
import useOpenedChat from "@/hooks/useOpenedChat";
import { Phone, Video, EllipsisVertical, Image, File } from "lucide-react";
import UserIcon from "@/components/UserIcon";
import { useEffect, useRef, useState } from "react";
import { Message, User } from "@/lib/types";
import useAuth from "@/hooks/useAuth";
import { SERVER_URL } from "@/lib/constants";
import { cn, formatChatDate, makePayload } from "@/lib/utils";
import ContentCenteredDiv from "@/components/ContentCenteredDiv";
import useWebsocket from "@/hooks/useWebsocket";

export default function ChatArea() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState("");

  useAutosizeTextArea(textareaRef.current, message);

  const { partner: chatPartner } = useOpenedChat();
  const { alive: wsAlive, sendData: wsSendData } = useWebsocket();

  if (chatPartner === null) {
    return (
      <div className="h-full flex justify-center items-center">
        <h2 className="text-xl">No chat selected!</h2>
      </div>
    );
  }

  function sendMessageOnEnterKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function sendMessage() {
    const text = message.trim();
    if (!text) return;
    if (!wsAlive) {
      console.error("Cannot send message, websocket connection not alive!");
      return;
    }
    wsSendData(
      JSON.stringify({
        msgType: "chatMsgSend",
        msgData: {
          receiverId: chatPartner.id,
          text: text,
          timestamp: new Date().toISOString(),
        },
      }),
    );
    console.log("Sending message", text, "to", chatPartner.username);
    textareaRef.current!.value = "";
    setMessage("");
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

      {/* Text area */}
      <div className="flex gap-2 items-center py-2 px-4 border-t">
        <Image className="cursor-pointer" />
        <File className="cursor-pointer" />
        <Textarea
          onChange={(e) => e.target && setMessage(e.target.value)}
          onKeyDown={sendMessageOnEnterKey}
          rows={1}
          placeholder="Enter message..."
          className="flex-grow ml-2 max-h-[80px]"
          ref={textareaRef}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}

function ChatMessages({ partner }: { partner: User }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { userId: ourId } = useAuth();

  const { data: wsData } = useWebsocket();

  useEffect(() => {
    fetchChatMessages(ourId, partner.id)
      .then((msgs) => setMessages(msgs || []))
      .catch(console.error);
  }, [partner]);

  // Update messages state and sessionStorage when message is recieved via ws
  useEffect(() => {
    if (wsData === null) return;
    if (wsData.msgType === "chatMsgReceive") {
      const newList = [wsData.msgData as Message, ...messages];
      setMessages(newList);
      sessionStorage.setItem(`messages-${partner.id}`, JSON.stringify(newList));
    }
  }, [wsData]);

  if (messages.length === 0) {
    return <ContentCenteredDiv>No messages!</ContentCenteredDiv>;
  }

  return (
    <div className="h-full flex flex-col-reverse overflow-scroll gap-1 p-2">
      {messages.map((msg, i) => {
        const showMsgTime = i > 0 && msg.senderId !== messages[i - 1].senderId;
        const msgTime = formatChatDate(msg.timestamp);
        return (
          <div className="flex flex-col gap-1" key={msg.id}>
            <div
              className={cn(
                "py-1 px-2 flex max-w-[60%] items-center rounded-md",
                msg.senderId === ourId
                  ? "border items-end self-end"
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

async function fetchChatMessages(
  ourId: number,
  partnerId: number,
  useCache: boolean = true,
): Promise<Message[]> {
  const url = `${SERVER_URL}/api/messages/${partnerId}`;
  const storageKey = `messages-${partnerId}`;

  return new Promise<Message[]>((resolve, reject) => {
    if (useCache) {
      const data = sessionStorage.getItem(storageKey);
      if (data !== null) {
        console.log(`Resolved ${url} from sessionStorage`);
        return resolve(JSON.parse(data) as Message[]);
      }
    }

    fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        if (payload.ok) {
          console.log(`Fetched ${url} from server`);
          const msgs = payload.messages as Message[];
          sessionStorage.setItem(storageKey, JSON.stringify(msgs));
          resolve(msgs);
        } else {
          throw payload.message || "Unknown error occurred"; // this one is error message
        }
      })
      .catch((err) => reject(`Error fetching ${url}: ${err}`));
  });
}
