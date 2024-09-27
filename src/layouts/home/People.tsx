import ContentCenteredDiv from "@/components/ContentCenteredDiv";
import useOpenedChat from "@/hooks/useOpenedChat";
import { SERVER_URL } from "@/lib/constants";
import { User } from "@/lib/types";
import { cn, debounce, makePayload } from "@/lib/utils";
import { Navigate } from "react-router-dom";
import UserIcon from "@/components/UserIcon";
import { useState, useEffect, useMemo, ComponentProps } from "react";
import DummyText from "@/components/DummyText";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  MessageCircleMore,
  UserRoundPlus,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function People() {
  // const [input, setInput] = useState<string>("");
  const [results, setResults] = useState<User[]>([]);
  const [unauthorized, setUnauthorized] = useState(false);

  const searchUser = useMemo(() => {
    return debounce((query: string) => {
      if (query.length === 0) return;
      const params = new URLSearchParams([
        ["type", "normal"],
        ["query", query],
      ]);
      // setLoading(true);
      const url = `${SERVER_URL}/api/search?${params}`;
      fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      })
        .then((res) => makePayload(res))
        .then((payload) => {
          console.log(`Payload for ${url}:`, payload);
          if (payload.ok) {
            setResults(payload.results || []);
          } else {
            setUnauthorized(payload.status === 401);
            throw new Error(payload.message || "Unknown error");
          }
        })
        .catch((err) => console.log(`Error fetching ${url}: ${err}`));
      // .finally(() => setLoading(false));
    }, 250);
  }, []);

  if (unauthorized) return <Navigate to="/get-started" />;

  return (
    <div className="overflow-auto h-full flex flex-col">
      <div className="flex-shrink-0 h-[60px] flex items-center justify-center border-b p-2">
        <h1 className="text-xl font-bold">People</h1>
      </div>
      <div className="px-2 py-4">
        <Input
          placeholder="Find people..."
          onChange={(e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
              searchUser(query);
            }
          }}
        />
      </div>
      {results.length > 0 ? (
        <SearchResults results={results} />
      ) : (
        <ContentCenteredDiv>No results!</ContentCenteredDiv>
      )}
    </div>
  );
}

function SearchResults({ results }: { results: User[] }) {
  const { userId: ourId } = useAuth();
  const { partner: activeChatPartner, setPartner: setActiveChatPartner } =
    useOpenedChat();

  return (
    <ul className="flex-grow overflow-scroll w-full px-2 py-4 flex flex-col gap-2">
      {results.map((user) => {
        const isActive = user.id === activeChatPartner?.id;
        return (
          <li
            key={user.id}
            className="p-4 flex items-center gap-2 cursor-pointer border rounded-md transition-colors"
            // onClick={() => setActiveChatPartner(user)}
          >
            <div>
              <UserIcon
                user={user}
                className={isActive ? "bg-background" : "bg-secondary"}
              />
            </div>
            <div className="flex-grow hover:underline">{user.fullname}</div>
            {user.id !== ourId && <UserActions targetUser={user} />}
          </li>
        );
      })}
    </ul>
  );
}

// What you can do with the user, message if friend, send request,
// accept incoming request, etc
function UserActions({
  targetUser,
  className,
  ...rest
}: { targetUser: User } & ComponentProps<"div">) {
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    const url = `${SERVER_URL}/api/friendship-status/${targetUser.id}`;
    fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
    })
      .then(makePayload)
      .then((payload) => {
        if (payload.ok) {
          if (!payload.friendshipStatus) {
            throw new Error("Cannot find field 'friendshipStatus' in payload");
          }
          setFriendshipStatus(payload.friendshipStatus);
        } else {
          throw payload.message || "Unknown error occurred";
        }
      })
      .catch((err) => console.error(`Error fetching ${url}: ${err}`))
      .finally(() => setLoading(false));
  }, [targetUser]);

  const btnClass = "flex gap-1 px-2 py-1 items-center text-sm";
  const iconSize = 20;

  return (
    <div
      className={cn("flex gap-2 items-center justify-center", className)}
      {...rest}
    >
      {friendshipStatus === "friends" && (
        <Button variant="outline" className={btnClass} title="Chat">
          <MessageCircleMore size={iconSize} />
          {/* Message */}
        </Button>
      )}
      {friendshipStatus === "req-sent" && (
        <Button variant="outline" className={btnClass} title="Requested">
          <ArrowRight size={iconSize} />
          {/* Requested */}
        </Button>
      )}
      {friendshipStatus === "req-received" && (
        <Button variant="outline" className={btnClass} title="Incoming request">
          <ArrowLeft size={iconSize} />
          {/* Incoming Request */}
        </Button>
      )}
      {friendshipStatus === "unknown" && (
        <Button variant="outline" className={btnClass} title="Send Request">
          <UserRoundPlus size={iconSize} />
          {/* Add */}
        </Button>
      )}
    </div>
  );
}
