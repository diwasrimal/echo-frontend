import { useEffect, useMemo, useState } from "react";
import User from "../types/User";
import { debounce, getLoggedInUserId, makePayload } from "../utils/utils";
import ContentCenteredDiv from "./ContentCenteredDiv";
import UserActions from "./UserActions";
import UserInfo from "./UserInfo";

export default function People() {
    const [input, setInput] = useState<string>("");
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const loggedInId = getLoggedInUserId();

    // Debounced search function
    const searchUser = useMemo(() => {
        return debounce((query: string) => {
            if (query.length === 0) return;
            const params = new URLSearchParams([
                ["type", "normal"],
                ["query", query],
            ]);
            const url = `/api/search?${params}`;
            console.log("fetching ", url);
            setLoading(true);
            fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })
                .then((res) => makePayload(res))
                .then((payload) => {
                    if (payload.ok) {
                        setResults(payload.results || []);
                    } else {
                        console.error(`Error msg: GET ${url}`, payload.message);
                    }
                })
                .catch((err) => console.error(`Error: GET ${url}`, err))
                .finally(() => setLoading(false));
        }, 250);
    }, []);

    // Call debounced search function on each keystroke
    useEffect(() => searchUser(input), [input]);

    return (
        <div className="w-full h-full border-1 flex flex-col">
            <input
                autoFocus
                type="text"
                onChange={(e) => setInput(e.target.value)}
                className="w-full py-2 px-4 rounded-lg outline-none border-none bg-gray-100"
                placeholder="Search people"
            />
            {loading ? (
                <ContentCenteredDiv>Loading...</ContentCenteredDiv>
            ) : results.length === 0 ? (
                <ContentCenteredDiv>No matches</ContentCenteredDiv>
            ) : (
                <ul className="h-full">
                    {results.map((user) => (
                        <li
                            key={user.id}
                            className="flex items-center justify-between p-4 border-b"
                        >
                            <UserInfo user={user} />
                            {user.id !== loggedInId && (
                                <UserActions otherUser={user} /> // Actions that can be perfromed with searched user
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
