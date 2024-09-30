import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useAutosizeTextArea from "@/hooks/useAutosizeTextArea";
import useOpenedChat from "@/hooks/useOpenedChat";
import { Phone, Video, EllipsisVertical, Image, File } from "lucide-react";
import UserIcon from "@/components/UserIcon";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { Message, User } from "@/lib/types";
import useAuth from "@/hooks/useAuth";
import { cn, formatChatDate } from "@/lib/utils";
import ContentCenteredDiv from "@/components/ContentCenteredDiv";
import useWebsocket from "@/hooks/useWebsocket";
import { fetchChatMessages } from "@/lib/fetchers";

export default function ChatArea() {
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

function MessageInputBox({
  partner: chatPartner,
}: { partner: User } & ComponentProps<"div">) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useAutosizeTextArea(textareaRef.current, text);

  const { alive: wsAlive, sendData: wsSendData } = useWebsocket();

  function sendMessage() {
    const txt = text.trim();
    if (!txt) return;
    if (!wsAlive) {
      console.error("Cannot send message, websocket connection not alive!");
      return;
    }
    try {
      console.log("Sending message", txt, "to", chatPartner.username);
      wsSendData(
        JSON.stringify({
          msgType: "chatMsgSend",
          msgData: {
            receiverId: chatPartner.id,
            text: txt,
            timestamp: new Date().toISOString(),
          },
        }),
      );
      setText("");
    } catch (err) {
      console.error(err);
    }
  }

  function sendMessageOnEnterKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      console.log("hERE");
      sendMessage();
    }
  }

  return (
    <div className="w-full h-full flex gap-2 items-center">
      <Image className="cursor-pointer" />
      <File className="cursor-pointer" />
      <Textarea
        onChange={(e) => e.target && setText(e.target.value)}
        value={text}
        onKeyDown={sendMessageOnEnterKey}
        rows={1}
        placeholder="Enter message..."
        className="flex-grow ml-2 max-h-[80px]"
        ref={textareaRef}
      />
      <Button onClick={sendMessage}>Send</Button>
    </div>
  );
}

function ChatMessages({ partner }: { partner: User }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { userId: ourId } = useAuth();

  const { data: wsData } = useWebsocket();

  useEffect(() => {
    fetchChatMessages(ourId, partner.id).then(setMessages).catch(console.error);
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
