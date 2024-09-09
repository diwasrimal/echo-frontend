import { useEffect, useState } from "react";
import { makePayload } from "../utils/utils";
import User from "../types/User";
import { Navigate } from "react-router-dom";
import ContentCenteredDiv from "./ContentCenteredDiv";
import UserInfo from "./UserInfo";
import UserActions from "./UserActions";

export default function Requests() {
    const [requestors, setRequestors] = useState<User[]>([]);
    const [unauthorized, setUnauthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/friend-requestors`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => makePayload(res))
            .then((payload) => {
                if (payload.ok) {
                    setRequestors((payload.friendRequestors as User[]) || []);
                } else {
                    setUnauthorized(payload.statusCode === 401);
                }
            })
            .catch((err) =>
                console.error(`Error: GET /api/friend-requestors`, err),
            )
            .finally(() => setLoading(false));
    }, []);

    if (unauthorized) return <Navigate to="/login" />;

    return (
        <div className="h-full flex flex-col">
            <h2 className="p-2">Requests</h2>
            {loading ? (
                <ContentCenteredDiv>Loading...</ContentCenteredDiv>
            ) : requestors.length === 0 ? (
                <ContentCenteredDiv>No friend requests!</ContentCenteredDiv>
            ) : (
                <ul>
                    {requestors.map((user) => (
                        <li
                            key={user.id}
                            className="flex items-center justify-between p-4 border-b"
                        >
                            <UserInfo user={user} />
                            <UserActions otherUser={user} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
