import DummyText from "@/components/DummyText";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import UserIcon from "@/components/UserIcon";
import { OpenedChatProvider } from "@/contexts/OpenedChatContext";
import useAutosizeTextArea from "@/hooks/useAutosizeTextArea";
import useOpenedChat from "@/hooks/useOpenedChat";
import {
  ArrowRightToLine,
  CircleUserRound,
  EllipsisVertical,
  File,
  Image,
  MessageCircle,
  Phone,
  Settings,
  UsersRound,
  Video,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, Outlet } from "react-router-dom";

export default function HomeLayout() {
  return (
    <div className="h-screen max-w-[1536px] m-auto p-2">
      <div className="border rounded-md flex h-full">
        <div className="flex flex-col">
          {/*Later convert to component maybe since all the titles in 3 columns use same height */}
          <div className="font-bold flex justify-center items-center h-[60px] border-b px-2">
            echo.
          </div>
          <div className="flex-grow">
            <NavBar />
          </div>
        </div>

        <OpenedChatProvider>
          <div className="hidden sm:w-[200px] sm:block lg:w-[300px] flex-shrink-0 h-full border-l">
            <Outlet />
          </div>
          <div className="flex-grow h-full border-l">
            <ChatArea />
          </div>
        </OpenedChatProvider>
      </div>
    </div>
  );
}

function NavBar() {
  return (
    <nav className="flex flex-col justify-between px-2 h-full items-center py-4">
      <ul className="flex flex-col gap-4">
        <Link to="/home/chats" title="Chats">
          <MessageCircle />
        </Link>
        <Link to="/home/people" title="People">
          <UsersRound />
        </Link>
      </ul>
      <ul className="flex flex-col gap-4">
        <CircleUserRound />
        <Link to="/settings" title="Settings">
          <Settings />
        </Link>
        <Link to="/logout" title="Logout">
          <ArrowRightToLine />
        </Link>
      </ul>
    </nav>
  );
}

function ChatArea() {
  const { partner: chatPartner } = useOpenedChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState("");

  useAutosizeTextArea(textareaRef.current, message);

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
      <div className="flex-grow overflow-scroll"></div>

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
