import ContentCenteredDiv from "@/components/ContentCenteredDiv";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  Check,
  MessageCircleMore,
  Terminal,
  UserRound,
  UserRoundPlus,
  UserRoundX,
  X,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  UserRoundArrowLeft,
  UserRoundXArrowRight,
} from "@/components/CustomIcons";
import { Toast } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";

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

  return (
    <ul className="flex-grow overflow-scroll w-full px-2 py-4 flex flex-col gap-2">
      {results.map((user) => {
        return (
          <li
            key={user.id}
            className="p-4 flex items-center gap-2 cursor-pointer border rounded-md transition-colors"
            // onClick={() => setActiveChatPartner(user)}
          >
            <div>
              <UserIcon user={user} />
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
  const [friendshipStatus, setFriendshipStatus] = useState("");
  const { setPartner: setChatPartner } = useOpenedChat();
  const [actionProcessing, setActionProcessing] = useState(false);

  useEffect(updateFriendshipStatus, [targetUser]);

  function updateFriendshipStatus() {
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
      .catch((err) => console.error(`Error fetching ${url}: ${err}`));
  }

  const btnClass = "flex gap-1 px-2 py-1 items-center text-sm";
  const iconSize = 20;

  return (
    <div
      className={cn("flex gap-2 items-center justify-center", className)}
      {...rest}
    >
      {friendshipStatus === "unknown" && (
        // <SendRequestButton
        //   targetUser={targetUser}
        //   className={btnClass}
        //   successFunc={updateFriendshipStatus}
        // >
        <Button
          variant="outline"
          className={btnClass}
          title="Send Request"
          onClick={() => {
            setActionProcessing(true);
            sendFriendRequest(targetUser)
              .then(() => {
                toast({
                  title: "Request Sent",
                  description: `Friend request sent to ${targetUser.fullname}.`,
                });
                updateFriendshipStatus();
              })
              .catch(console.error)
              .finally(() => setActionProcessing(false));
          }}
        >
          {actionProcessing ? (
            <LoadingSpinner />
          ) : (
            <UserRoundPlus size={iconSize} />
          )}
        </Button>
        // </SendRequestButton>
      )}
      {friendshipStatus === "friends" && (
        <Button
          variant="outline"
          className={btnClass}
          title="Chat"
          onClick={() => setChatPartner(targetUser)}
        >
          <MessageCircleMore size={iconSize} />
        </Button>
      )}
      {friendshipStatus === "req-sent" && (
        // <RequestCancelButton
        //   targetUser={targetUser}
        //   successFunc={updateFriendshipStatus}
        // >
        //   Cancel Request
        // </RequestCancelButton>
        <Button
          variant="outline"
          className={btnClass}
          title="Cancel Request"
          onClick={() => {
            setActionProcessing(true);
            cancelFriendRequest(targetUser)
              .then(() => {
                toast({
                  title: "Request Canceled",
                  description: `Your friend request to ${targetUser.fullname} has been canceled.`,
                });
                updateFriendshipStatus();
              })
              .catch(console.error)
              .finally(() => setActionProcessing(false));
          }}
        >
          {actionProcessing ? (
            <LoadingSpinner />
          ) : (
            <UserRoundXArrowRight size={iconSize} />
          )}
        </Button>
      )}
      {friendshipStatus === "req-received" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={btnClass}
              title="Incoming request"
            >
              <UserRoundArrowLeft size={iconSize} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() =>
                acceptFriendRequest(targetUser)
                  .then(updateFriendshipStatus)
                  .catch(console.error)
              }
            >
              <div className="flex gap-1">
                <Check size={20} />
                Accept
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                declineFriendRequest(targetUser)
                  .then(updateFriendshipStatus)
                  .catch(console.error)
              }
            >
              <div className="flex gap-1">
                <X size={20} />
                Decline
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function acceptFriendRequest(targetUser: User): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const url = `${SERVER_URL}/api/friends`;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ targetId: targetUser.id }),
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        if (payload.ok) {
          resolve();
        } else {
          throw payload.message || "Unknown error occured";
        }
      })
      .catch((err) => reject(`error fetching ${url}: ${err}`));
  });
}

function declineFriendRequest(targetUser: User): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    reject("TODO: implement decline request");
  });
}

function sendFriendRequest(targetUser: User): Promise<void> {
  const url = `${SERVER_URL}/api/friend-requests`;
  return new Promise<void>((resolve, reject) => {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ targetId: targetUser.id }),
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        if (payload.ok) {
          resolve();
        } else {
          throw payload.message || "Unknown error occurred!";
        }
      })
      .catch((err) => reject(`Error fetching ${url}: ${err}`));
  });
}

function cancelFriendRequest(targetUser: User): Promise<void> {
  const url = `${SERVER_URL}/api/friend-requests`;
  return new Promise<void>((resolve, reject) => {
    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ targetId: targetUser.id }),
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        if (payload.ok) {
          resolve();
        } else {
          throw payload.message || "Unknown error occurred!";
        }
      })
      .catch((err) => reject(`Error fetching ${url}: ${err}`));
  });
}

function SendRequestButton({
  targetUser,
  className,
  children,
  successFunc,
  ...rest
}: { targetUser: User; successFunc: () => void } & ComponentProps<"button">) {
  const [processing, setProcessing] = useState(false);

  function sendRequest() {
    setProcessing(true);
    const url = `${SERVER_URL}/api/friend-requests`;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ targetId: targetUser.id }),
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        if (payload.ok) {
          successFunc();
        } else {
          throw payload.message || "Unknown error occurred!";
        }
      })
      .catch((err) => console.error(`Error fetching ${url}:`, err))
      .finally(() => setProcessing(false));
  }

  return (
    <Button
      variant="outline"
      className={className}
      title="Send Request"
      onClick={sendRequest}
      {...rest}
    >
      {processing ? <LoadingSpinner /> : children}
    </Button>
  );
}

function RequestCancelButton({
  targetUser,
  className,
  children,
  successFunc,
  ...rest
}: { targetUser: User; successFunc: () => void } & ComponentProps<"button">) {
  const [processing, setProcessing] = useState(false);

  function cancelRequest() {
    setProcessing(true);
    const url = `${SERVER_URL}/api/friend-requests`;
    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ targetId: targetUser.id }),
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        if (payload.ok) {
          successFunc();
        } else {
          throw payload.message || "Unknown error occurred!";
        }
      })
      .catch((err) => console.error(`Error fetching ${url}:`, err))
      .finally(() => setProcessing(false));
  }

  return (
    <Button
      variant="outline"
      className={className}
      title="Cancel Request"
      onClick={cancelRequest}
      {...rest}
    >
      {processing ? <LoadingSpinner /> : children}
    </Button>
  );
}
