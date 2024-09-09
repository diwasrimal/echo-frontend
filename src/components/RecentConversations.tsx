import { useContext, useEffect } from "react";
import { ActiveChatPartnerContext } from "../contexts/ActiveChatPairProvider";
import ContentCenteredDiv from "./ContentCenteredDiv";
import UserInfo from "./UserInfo";
import { ChatPartnersContext } from "../contexts/ChatPartnersProvider";
import { WebsocketContext } from "../contexts/WebsocketProvider";
import Message from "../types/Message";
import { getLoggedInUserId, makePayload } from "../utils/utils";
import User from "../types/User";

export default function RecentConversations() {
    // const [partners, setPartners] = useState<User[]>([]);
    // const [errMsg, setErrMsg] = useState("");
    // const [unauthorized, setUnauthorized] = useState(false);
    // const [loading, setLoading] = useState(false);

    const { chatPartners, setChatPartners, errMsg, loading } =
        useContext(ChatPartnersContext);

    // Sets the active chat pair's id, which causes chats to be
    // loaded on chat window at right side
    const { activeChatPartner, setActiveChatPartner } = useContext(
        ActiveChatPartnerContext,
    );

    // When a message is received from a user that is not the active chat partner
    // we change the conversations list to show the most recent chat partner at top
    const { wsData } = useContext(WebsocketContext);
    useEffect(() => {
        if (wsData?.msgType === "chatMsgReceive") {
            const msg = wsData.msgData as Message;
            if (
                msg.senderId === getLoggedInUserId() ||
                msg.senderId === activeChatPartner?.id
            ) {
                return;
            }
            // TODO: maybe cache into session storage
            const url = `/api/users/${msg.senderId}`;
            fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })
                .then((res) => makePayload(res))
                .then((payload) => {
                    if (payload.ok) {
                        const messager = payload.user as User;
                        setChatPartners!([
                            messager,
                            ...chatPartners.filter((p) => p.id !== messager.id),
                        ]);
                    } else {
                        throw new Error(`errmsg: ${payload.message}`);
                    }
                })
                .catch((err) => console.error(`Error: GET ${url}:`, err));
        }
    }, [wsData]);

    // Get people logged in user has chatted with
    // useEffect(() => {
    //     setLoading(true);
    //     fetch("/api/chat-partners", {
    //         headers: { "Content-Type": "application/json" },
    //     })
    //         .then((res) => makePayload(res))
    //         .then((payload) => {
    //             if (payload.ok) {
    //                 setPartners(payload.partners || []);
    //                 console.log(payload.partners);
    //             } else {
    //                 setUnauthorized(payload.statusCode === 401);
    //                 setErrMsg(payload.message);
    //             }
    //         })
    //         .catch((err) =>
    //             console.error("Error: GET /api/chat-partners:", err),
    //         )
    //         .finally(() => setLoading(false));
    // }, []);

    // if (unauthorized) return <Navigate to="/login" />;
    if (loading) return <ContentCenteredDiv>Loading...</ContentCenteredDiv>;

    if (errMsg) return <p className="text-red-400">{errMsg}</p>;
    if (chatPartners.length === 0)
        return <ContentCenteredDiv>No recent chats</ContentCenteredDiv>;

    return (
        <div className="h-full flex flex-col">
            <h2 className="p-2">Chats</h2>
            <ul className="flex flex-col">
                {chatPartners.map((user) => (
                    <li
                        key={user.id}
                        className={`p-4 border-b hover:cursor-pointer ${activeChatPartner?.id === user.id ? "bg-gray-100" : "hover:bg-gray-50"}`}
                        onClick={() => setActiveChatPartner!(user)}
                    >
                        <UserInfo user={user} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
