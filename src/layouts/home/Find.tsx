import ContentCenteredDiv from "@/components/ContentCenteredDiv";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  UserRoundArrowLeft,
  UserRoundXArrowRight,
} from "@/components/CustomIcons";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserIcon from "@/components/UserIcon";
import { toast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import { SERVER_URL } from "@/lib/constants";
import { User, UserSearchMethod } from "@/lib/types";
import { cn, debounce, makePayload } from "@/lib/utils";
import {
  Check,
  MessageCircleMore,
  Search,
  UserRoundPlus,
  X,
} from "lucide-react";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import useChatPartners from "@/hooks/useChatPartners";

export default function Find() {
  // const [input, setInput] = useState<string>("");
  const [results, setResults] = useState<User[]>([]);
  const [unauthorized, setUnauthorized] = useState(false);
  const [searching, setSearching] = useState(false);

  const searchUser = useMemo(() => {
    return debounce((type: UserSearchMethod, query: string) => {
      if (query.length === 0) return;
      const params = new URLSearchParams([
        ["type", type],
        ["query", query],
      ]);
      setSearching(true);
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
        .catch((err) => console.log(`Error fetching ${url}: ${err}`))
        .finally(() => setSearching(false));
    }, 250);
  }, []);

  if (unauthorized) return <Navigate to="/get-started" />;

  return (
    <div className="overflow-auto h-full flex flex-col">
      <div className="flex-shrink-0 h-[60px] flex items-center justify-center border-b p-2">
        <h1 className="text-xl font-bold">Find People</h1>
      </div>
      <div className="px-2 py-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <Search size={20} />
          </span>
          <Input
            className="pl-8 pr-8"
            placeholder="Search @username or just name..."
            onChange={(e) => {
              let query = e.target.value.trim();
              if (!query) return;
              let searchType: UserSearchMethod;
              if (query.startsWith("@")) {
                query = query.substring(1);
                searchType = "by-username";
              } else {
                searchType = "normal";
              }
              searchUser(searchType, query);
            }}
          />
          {searching && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
              <LoadingSpinner />
            </span>
          )}
        </div>
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
    <ul className="flex-grow overflow-auto w-full px-2 flex flex-col gap-2">
      {results.map((user) => {
        return (
          <li
            key={user.id}
            className="p-4 flex items-center gap-2 cursor-pointer border rounded-md transition-colors"
          >
            <div>
              <UserIcon user={user} />
            </div>
            <div className="flex-grow hover:underline">
              <div>{user.fullname}</div>
              <div className="text-xs text-muted-foreground">
                @{user.username}
              </div>
            </div>
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
  const { setActivePartner: setActiveChatPartner } = useChatPartners();
  const [actionProcessing, setActionProcessing] = useState(false);

  useEffect(setFriendshipStatusAgain, [targetUser]);

  function setFriendshipStatusAgain() {
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
      {/* Just a spinner until status is fetched and set */}
      {friendshipStatus === "" && (
        <Button variant="outline" className={btnClass}>
          <LoadingSpinner />
        </Button>
      )}
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
                setFriendshipStatusAgain();
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
          onClick={() => setActiveChatPartner(targetUser)}
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
            deleteFriendRequest(targetUser)
              .then(() => {
                toast({
                  title: "Request Canceled",
                  description: `Your friend request to ${targetUser.fullname} has been canceled.`,
                });
                setFriendshipStatusAgain();
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
                  .then(setFriendshipStatusAgain)
                  .catch(console.error)
              }
            >
              <div className="flex gap-1">
                <Check size={20} />
                Accept
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                console.log("Deleteing request of", targetUser);
                deleteFriendRequest(targetUser)
                  .then(setFriendshipStatusAgain)
                  .catch(console.error);
              }}
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

function deleteFriendRequest(targetUser: User): Promise<void> {
  console.log("delete");
  const url = `${SERVER_URL}/api/friend-requests/${targetUser.id}`;
  return new Promise<void>((resolve, reject) => {
    fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
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
