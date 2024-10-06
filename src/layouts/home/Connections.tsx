import ContentCenteredDiv from "@/components/ContentCenteredDiv";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button, ButtonProps } from "@/components/ui/button";
import UserList from "@/components/UserList";
import { SERVER_URL } from "@/lib/constants";
import { fetchUserInfo } from "@/lib/fetchers";
import { FriendRequest, User } from "@/lib/types";
import { debounce, makePayload } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";
import { ComponentProps, useEffect, useState } from "react";

export default function Connections() {
  const [loading, setLoading] = useState(true);
  const [showIncomingRequest, setShowIncomingRequest] = useState(true);
  const [requestors, setRequestors] = useState<User[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchFriendRequests(showIncomingRequest ? "received" : "sent")
      .then((res) => makePayload(res))
      .then(async (payload) => {
        if (payload.ok) {
          const reqs = (payload.friendRequests || []) as FriendRequest[];
          const requestors: User[] = [];
          for (const req of reqs) {
            const otherUserId = showIncomingRequest
              ? req.requestorId
              : req.receiverId;
            requestors.push(await fetchUserInfo(otherUserId));
          }
          setRequestors(requestors);
        } else {
          throw payload.message || "Unknown error occurred!";
        }
      })
      .catch((err) =>
        console.error(`Error fetching received friend requests: ${err}`),
      )
      .finally(() => setLoading(false));
  }, [showIncomingRequest]);

  return (
    <div className="h-full overflow-auto flex flex-col">
      <div className="flex-shrink-0 h-[60px] flex items-center justify-center border-b p-2">
        <h1 className="text-xl font-bold">Connections</h1>
      </div>

      <div className="flex justify-between items-center py-2 px-2">
        <h3 className="font-bold text-lg">
          {showIncomingRequest ? "Incoming" : "Outgoing"} Requests
        </h3>
        <Button
          disabled={loading}
          variant="outline"
          className="px-2"
          onClick={() => setShowIncomingRequest(!showIncomingRequest)}
          title={`Show ${showIncomingRequest ? "outgoing" : "incoming"} requests`}
        >
          {loading ? <LoadingSpinner /> : <ArrowLeftRight size={20} />}
        </Button>
      </div>

      {!loading &&
        (requestors.length === 0 ? (
          <ContentCenteredDiv>No requests found!</ContentCenteredDiv>
        ) : (
          <UserList users={requestors} showActions={true} className="px-2" />
        ))}
    </div>
  );
}

// TODO: maybe cache this in session storage, and later use websocket to notify
// new incoming requests
function fetchFriendRequests(reqType: "sent" | "received"): Promise<Response> {
  const url = `${SERVER_URL}/api/friend-requests?type=${reqType}`;
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
  });
}
