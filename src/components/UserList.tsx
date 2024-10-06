import { toast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import useChatPartners from "@/hooks/useChatPartners";
import { SERVER_URL } from "@/lib/constants";
import { User } from "@/lib/types";
import { makePayload, cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Check, MessageCircleMore, UserRoundPlus, X } from "lucide-react";
import { ComponentProps, useEffect, useState } from "react";
import { UserRoundXArrowRight, UserRoundArrowLeft } from "./CustomIcons";
import { LoadingSpinner } from "./LoadingSpinner";
import { Button } from "./ui/button";
import UserIcon from "./UserIcon";

type UserListProps = ComponentProps<"ul"> & {
  users: User[];
  showActions?: boolean;
};

export default function UserList({
  users,
  showActions = false,
  className,
  ...rest
}: UserListProps) {
  const { userId: ourId } = useAuth();

  return (
    <ul
      className={cn(
        "flex-grow overflow-auto w-full flex flex-col gap-2",
        className,
      )}
      {...rest}
    >
      {users.map((user) => (
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
          {showActions && user.id !== ourId && (
            <UserActions targetUser={user} />
          )}
        </li>
      ))}
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
                console.log("Deleting request of", targetUser);
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
