import useAutosizeTextArea from "@/hooks/useAutosizeTextArea";
import useWebsocket from "@/hooks/useWebsocket";
import { User } from "@/lib/types";
import { ComponentProps, useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Image, File } from "lucide-react";

export default function MessageInputBox({
  partner: chatPartner,
}: { partner: User } & ComponentProps<"div">) {
  const draftkey = `message-draft-${chatPartner.id}`;

  const [text, setText] = useState(sessionStorage.getItem(draftkey) || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useAutosizeTextArea(textareaRef.current, text);

  const { alive: wsAlive, sendData: wsSendData } = useWebsocket();

  // Places cursor at end of text area
  useEffect(() => {
    textareaRef.current!.focus();
    textareaRef.current!.selectionStart = textareaRef.current!.value.length;
  }, []);

  useEffect(() => {
    sessionStorage.setItem(draftkey, text);
  }, [draftkey, text]);

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
      sendMessage();
    }
  }

  return (
    <div className="w-full h-full flex gap-2 items-center">
      <Image className="cursor-pointer" />
      <File className="cursor-pointer" />
      <Textarea
        autoFocus
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
