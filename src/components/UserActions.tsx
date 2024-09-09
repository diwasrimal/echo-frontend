import UserPlusIcon from "../assets/user-plus.svg";
import UserMinusIcon from "../assets/user-minus.svg";
import UserCrossIcon from "../assets/user-x.svg";
import CheckIcon from "../assets/check.svg";
import CrossIcon from "../assets/cross.svg";
import MessageIcon from "../assets/message.svg";
import { makePayload } from "../utils/utils";
import { useContext, useEffect, useState } from "react";
import User from "../types/User";
import { Navigate } from "react-router-dom";
import { ActiveChatPartnerContext } from "../contexts/ActiveChatPairProvider";

type UserActionsProps = {
    otherUser: User;
};

export default function UserActions({ otherUser }: UserActionsProps) {
    const [friendshipStatus, setFriendshipStatus] = useState("");

    // Find out friendship status among logged in user and given user first
    useEffect(updateFriendshipStatus, [otherUser]);

    function updateFriendshipStatus() {
        const url = `/api/friendship-status/${otherUser.id}`;
        fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => makePayload(res))
            .then((payload) => {
                if (payload.ok) {
                    setFriendshipStatus(payload.friendshipStatus);
                } else {
                    console.error(`Error msg: ${url}`, payload.message);
                }
            })
            .catch((err) => console.error(`Error: ${url}`, err));
    }

    let actions: JSX.Element;
    switch (friendshipStatus) {
        case "unknown":
            actions = (
                <button
                    className="border bg-blue-300 p-1 rounded-md"
                    title="Send friend request"
                    onClick={() =>
                        sendRequest(otherUser, updateFriendshipStatus)
                    }
                >
                    <img src={UserPlusIcon} />
                </button>
            );
            break;
        case "req-sent":
            actions = (
                <button
                    className="border bg-red-300 p-1 rounded-md"
                    onClick={() =>
                        cancelRequest(otherUser, updateFriendshipStatus)
                    }
                    title="Cancel friend request"
                >
                    <img src={UserMinusIcon} />
                </button>
            );
            break;
        case "req-received":
            actions = (
                <>
                    <button
                        className="border bg-red-300 p-1 rounded-md"
                        onClick={() =>
                            rejectRequest(otherUser, updateFriendshipStatus)
                        }
                        title="Reject friend request"
                    >
                        <img src={CrossIcon} />
                    </button>
                    <button
                        className="border bg-green-300 p-1 rounded-md"
                        onClick={() =>
                            acceptRequest(otherUser, updateFriendshipStatus)
                        }
                        title="Accept friend request"
                    >
                        <img src={CheckIcon} />
                    </button>
                </>
            );
            break;
        case "friends":
            actions = (
                <button
                    className="border bg-red-300 p-1 rounded-md"
                    onClick={() =>
                        confirm("Are you sure?") &&
                        unfriend(otherUser, updateFriendshipStatus)
                    }
                    title="Unfriend"
                >
                    <img src={UserCrossIcon} />
                </button>
            );
            break;
        default:
            actions = <p>???</p>;
    }

    return (
        <div className="flex gap-2">
            {actions}
            <StartChatButton user={otherUser} />
        </div>
    );
}

function sendRequest(to: User, onSuccess?: () => void) {
    fetch("/api/friend-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: to.id }),
    })
        .then((res) => makePayload(res))
        .then((payload) => {
            if (payload.ok) {
                onSuccess && onSuccess();
            } else {
                console.error(
                    "Error msg: POST /api/friend-requests, target:",
                    to,
                    payload.message,
                );
            }
        })
        .catch((err) =>
            console.error("Error: POST /api/friend-requests, target:", to, err),
        );
}

function cancelRequest(to: User, onSuccess?: () => void) {
    fetch(`/api/friend-requests`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: to.id }),
    })
        .then((res) => makePayload(res))
        .then((payload) => {
            if (payload.ok) {
                onSuccess && onSuccess();
            } else {
                console.error(
                    "Error msg: DELETE /api/friend-requests, target:",
                    to,
                    payload.message,
                );
            }
        })
        .catch((err) =>
            console.error(
                "Error: DELETE /api/friend-requests, target:",
                to,
                err,
            ),
        );
}

// @ts-ignore
function rejectRequest(from: User, onSuccess?: () => void) {
    console.log("TODO: implement rejectRequest()");
}

function acceptRequest(from: User, onSuccess?: () => void) {
    fetch(`/api/friends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: from.id }),
    })
        .then((res) => makePayload(res))
        .then((payload) => {
            if (payload.ok) {
                onSuccess && onSuccess();
            } else {
                console.error(
                    "Error msg: POST /api/friends, target:",
                    from,
                    payload.message,
                );
            }
        })
        .catch((err) =>
            console.error("Error: POST /api/friends, target:", from, err),
        );
}

function unfriend(user: User, onSuccess?: () => void) {
    fetch(`/api/friends`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: user.id }),
    })
        .then((res) => makePayload(res))
        .then((payload) => {
            if (payload.ok) {
                onSuccess && onSuccess();
            } else {
                console.error(
                    "Error msg: DELETE /api/friends, target:",
                    user,
                    payload.message,
                );
            }
        })
        .catch((err) =>
            console.error("Error: DELETE /api/friends, target:", user, err),
        );
}

function StartChatButton({ user }: { user: User }) {
    const [shouldNavigate, setShouldNavigate] = useState(false);
    const { setActiveChatPartner } = useContext(ActiveChatPartnerContext);

    function startChat() {
        // Set user as active chat partner and navigate to chats
        setActiveChatPartner!(user);
        setShouldNavigate(true);
    }

    if (shouldNavigate) return <Navigate to="/chats" />;

    return (
        <button
            className="border bg-blue-300 p-1 rounded-md"
            onClick={startChat}
            title="Message"
        >
            <img src={MessageIcon} />
        </button>
    );
}
