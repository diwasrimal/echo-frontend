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
import { cn, makePayload } from "@/lib/utils";
import ContentCenteredDiv from "@/components/ContentCenteredDiv";

export default function ChatArea() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState("");

  useAutosizeTextArea(textareaRef.current, message);

  const { partner: chatPartner } = useOpenedChat();

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
      <div className="flex-grow overflow-scroll">
        <ChatMessages partner={chatPartner} />
      </div>

      {/* Text area */}
      <div className="flex gap-2 items-center py-2 px-4 border-t">
        <Image className="cursor-pointer" />
        <File className="cursor-pointer" />
        <Textarea
          onChange={(e) => e.target && setMessage(e.target.value)}
          rows={1}
          placeholder="Enter message..."
          className="flex-grow ml-2 max-h-[80px]"
          ref={textareaRef}
        />
        <Button>Send</Button>
      </div>
    </div>
  );
}

function ChatMessages({ partner }: { partner: User }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { userId: ourId } = useAuth();

  useEffect(() => {
    fetchChatMessages(ourId, partner.id).then(setMessages).catch(console.error);
  }, [partner]);

  if (messages.length === 0) {
    return <ContentCenteredDiv>No messages!</ContentCenteredDiv>;
  }

  return (
    <div className="h-full flex flex-col gap-3 p-2">
      {messages.map((msg) => (
        <div
          className={cn(
            "p-2 flex max-w-[60%] items-center rounded",
            msg.senderId === ourId
              ? "border items-end self-end"
              : "bg-secondary items-start self-start",
          )}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}

async function fetchChatMessages(
  ourId: number,
  partnerId: number,
  useCache: boolean = true,
): Promise<Message[]> {
  const url = `${SERVER_URL}/api/messages/${partnerId}`;

  return new Promise<Message[]>((resolve, reject) => {
    if (useCache) {
      const data = sessionStorage.getItem(url);
      if (data !== null) {
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
          const msgs = payload.messages as Message[];
          sessionStorage.setItem(url, JSON.stringify(msgs));
          resolve(msgs);
        } else {
          throw payload.message || "Unknown error occurred"; // this one is error message
        }
      })
      .catch((err) => reject(`Error fetching ${url}: ${err}`));
  });
}
