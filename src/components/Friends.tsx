import { useEffect, useState } from "react";
import { makePayload } from "../utils/utils";
import User from "../types/User";
import { Navigate } from "react-router-dom";
import ContentCenteredDiv from "./ContentCenteredDiv";
import UserInfo from "./UserInfo";
import UserActions from "./UserActions";

export default function Friends() {
    const [friends, setFriends] = useState<User[]>([]);
    const [unauthorized, setUnauthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/friends`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => makePayload(res))
            .then((payload) => {
                if (payload.ok) {
                    setFriends((payload.friends as User[]) || []);
                } else {
                    setUnauthorized(payload.statusCode === 401);
                }
            })
            .catch((err) => console.error(`Error: GET /api/friends`, err))
            .finally(() => setLoading(false));
    }, []);

    if (unauthorized) return <Navigate to="/login" />;

    return (
        <div className="h-full flex flex-col">
            <h2 className="p-2">Friends</h2>
            {loading ? (
                <ContentCenteredDiv>Loading...</ContentCenteredDiv>
            ) : friends.length === 0 ? (
                <ContentCenteredDiv>No friends!</ContentCenteredDiv>
            ) : (
                <ul>
                    {friends.map((user) => (
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
