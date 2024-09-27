import { OpenedChatProvider } from "@/contexts/OpenedChatProvider";
import {
  ArrowRightToLine,
  CircleUserRound,
  MessageCircle,
  Settings,
  UsersRound,
} from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import ChatArea from "./ChatArea";
import WebsocketProvider from "@/contexts/WebsocketProvider";
import UserIcon from "@/components/UserIcon";

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

        <WebsocketProvider>
          <OpenedChatProvider>
            <div className="hidden sm:w-[200px] sm:block lg:w-[300px] flex-shrink-0 h-full border-l">
              <Outlet />
            </div>
            <div className="flex-grow h-full border-l">
              <ChatArea />
            </div>
          </OpenedChatProvider>
        </WebsocketProvider>
      </div>
    </div>
  );
}

function NavBar() {
  return (
    <nav className="flex flex-col justify-between px-2 h-full items-center py-4">
      <ul className="flex flex-col gap-4">
        <Link to="/home/conversations" title="Chats">
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
