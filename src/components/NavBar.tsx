import useAuth from "@/hooks/useAuth";
import { fetchUser } from "@/lib/fetchers";
import { User } from "@/lib/types";
import {
  MessageCircle,
  UserRoundSearch,
  ContactRound,
  CircleUserRound,
  ArrowRightToLine,
} from "lucide-react";
import UserIcon from "./UserIcon";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ModeToggle } from "./ui/mode-toggle";

export default function NavBar() {
  const [user, setUser] = useState<User>();
  const { userId } = useAuth();

  useEffect(() => {
    fetchUser(userId).then(setUser).catch(console.error);
  }, [userId]);

  return (
    <nav className="flex flex-col justify-between px-2 h-full items-center py-4">
      <ul className="flex flex-col gap-4">
        <Link to="/home/conversations" title="Your Chats">
          <MessageCircle />
        </Link>
        <Link to="/home/find" title="Find People">
          <UserRoundSearch />
        </Link>
        <Link to="/home/connections" title="Your Connections">
          <ContactRound />
        </Link>
      </ul>
      <ul className="flex flex-col gap-4 items-center">
        <div className="cursor-pointer">
          {user ? <UserIcon user={user} /> : <CircleUserRound />}
        </div>
        <div title="Theme">
          <ModeToggle />
        </div>
        {/* <Link to="/settings" title="Settings">
          <Settings />
        </Link> */}
        <Link to="/logout" title="Logout">
          <ArrowRightToLine />
        </Link>
      </ul>
    </nav>
  );
}
