import {
    FormEvent,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Navigate } from "react-router-dom";
import { ActiveChatPartnerContext } from "../contexts/ActiveChatPairProvider";
import Message from "../types/Message";
import {
    formatChatDate,
    getLoggedInUserId,
    getMessagesFromSession,
    makePayload,
    saveMessagesToSession,
} from "../utils/utils";
import ContentCenteredDiv from "./ContentCenteredDiv";
import { WebsocketContext } from "../contexts/WebsocketProvider";
import UserInfo from "./UserInfo";

export default function ActiveChat() {
    // const messages = useLoaderData() as Message[];
    const [messages, setMessages] = useState<Message[]>([]);
    const [unauthorized, setUnauthorized] = useState(false);
    const messageContainerRef = useRef<HTMLDivElement>(null);

    // Load messages from sessionStorage or from server
    const { activeChatPartner } = useContext(ActiveChatPartnerContext);
    useEffect(() => {
        if (!activeChatPartner) return;
        const messages = getMessagesFromSession(activeChatPartner.id);
        if (messages) {
            setMessages(messages);
            return;
        }
        const url = `/api/messages/${activeChatPartner.id}`;
        console.log(`fetching ${url}...`);
        fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => makePayload(res))
            .then((payload) => {
                if (payload.ok) {
                    const msgs = payload.messages as Message[];
                    setMessages(msgs || []);
                    saveMessagesToSession(activeChatPartner.id, msgs);
                } else {
                    setUnauthorized(payload.statusCode === 401);
                }
            })
            .catch((err) => console.error(`Error: GET ${url}:`, err));
    }, [activeChatPartner]);

    // When message is received, scroll to bottom of page and also
    // store the messages in session storage
    useEffect(() => {
        const el = messageContainerRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
        if (activeChatPartner)
            saveMessagesToSession(activeChatPartner.id, messages);
    }, [messages, activeChatPartner]);

    // Update messages state when received through websocket connection
    // If the message was with currently active chat partner, then we have to setMessages().
    // If some other user sent a message, we store that in session storage corresponding to sender.
    const { wsData } = useContext(WebsocketContext);
    useEffect(() => {
        console.log("wsData has changed:", wsData);
        if (wsData?.msgType === "chatMsgReceive") {
            const msg = wsData.msgData as Message;
            const sentByPartner = msg.senderId === activeChatPartner?.id;
            const sentByMePreviously =
                msg.senderId === getLoggedInUserId() &&
                msg.receiverId === activeChatPartner?.id;

            if (sentByMePreviously || sentByPartner) {
                setMessages([msg, ...messages]);
                return;
            }

            // Message was sent my user that's not the active chat partner
            // In this case we update the messages in session storage for the sender
            // If messages are not in session, fetch from server and store to session storage
            const prevMsgs = getMessagesFromSession(msg.senderId);
            if (prevMsgs !== undefined) {
                saveMessagesToSession(msg.senderId, [msg, ...prevMsgs]);
                return;
            }
            const url = `/api/messages/${msg.senderId}`;
            fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })
                .then((res) => makePayload(res))
                .then((payload) => {
                    if (payload.ok) {
                        saveMessagesToSession(msg.senderId, [
                            msg,
                            ...(payload.messages as Message[]),
                        ]);
                    } else {
                        setUnauthorized(payload.statusCode === 401);
                    }
                })
                .catch((err) => console.error(`Error: GET ${url}:`, err));
        }
    }, [wsData]);

    if (unauthorized) return <Navigate to="/login" />;
    if (!activeChatPartner)
        return <ContentCenteredDiv>Select a chat!</ContentCenteredDiv>;

    return (
        <div className="h-full w-full flex flex-col">
            {/* User info */}
            <div className="p-3 border-b-2 font-medium drop-shadow-md">
                <UserInfo user={activeChatPartner} />
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-scroll" ref={messageContainerRef}>
                {messages.length > 0 ? (
                    <MessageList messages={messages} />
                ) : (
                    <ContentCenteredDiv>No messages found</ContentCenteredDiv>
                )}
            </div>
            {/* Message box to write */}
            <div className="h-[50px]">
                <MessageBox receiverId={activeChatPartner.id} />
            </div>
        </div>
    );
}

// Assumes that messages is not []
function MessageList({ messages }: { messages: Message[] }) {
    // Create a list of group of messages based on who sent them
    // console.log("messages:", messages);
    const messageGroups = useMemo(() => {
        if (messages.length === 0) return [];
        const groups: Message[][] = [];
        let group = [messages[0]];

        for (let i = 1; i < messages.length; i++) {
            if (messages[i].senderId != messages[i - 1].senderId) {
                groups.push(group);
                group = [];
            }
            group.push(messages[i]);
        }
        if (group.length !== 0) groups.push(group); // last remaining group
        return groups;
    }, [messages]);

    return (
        <ul className="flex flex-col-reverse gap-2 p-2">
            {messageGroups.map((group) => {
                return (
                    <li
                        key={`${group[0].id}:${group[0].timestamp}`}
                        className={`flex flex-col`}
                    >
                        <MessageGroupItems group={group} />
                    </li>
                );
            })}
        </ul>
    );
}

function MessageGroupItems({ group }: { group: Message[] }) {
    const sent = group[0].senderId === getLoggedInUserId();
    const align = sent ? "items-end self-end" : "items-start self-start";
    return (
        <>
            <ul className={`flex flex-col-reverse gap-1 max-w-[70%] ${align}`}>
                {group.map((msg) => (
                    <li
                        title={`${sent ? "Sent on" : "Received on"} ${formatChatDate(msg.timestamp)}`}
                        key={msg.id}
                        className={`py-1 px-2 border rounded-md ${
                            sent ? "bg-green-100" : "bg-gray-100"
                        }`}
                    >
                        {msg.text}
                    </li>
                ))}
            </ul>
            {/* Latest message's timestamp, latest is at index 0 */}
            <time className={`text-xs text-gray-400 px-2 py-1 ${align}`}>
                {formatChatDate(group[0].timestamp)}
            </time>
        </>
    );
}

function MessageBox({ receiverId }: { receiverId: number }) {
    const messageRef = useRef<HTMLTextAreaElement>(null);
    const { wsSend } = useContext(WebsocketContext);

    function sendMessage(e?: FormEvent) {
        e?.preventDefault();
        const text = messageRef.current!.value.trim();
        if (text.length === 0) return;
        if (wsSend === undefined) {
            console.error("wsSend === undefined, cannot send msg.");
            return;
        }
        wsSend(
            JSON.stringify({
                msgType: "chatMsgSend",
                msgData: {
                    receiverId: receiverId,
                    text: text,
                    timestamp: new Date().toISOString(),
                },
            }),
        );
        console.log("Sending message", text);
        messageRef.current!.value = "";
    }

    const sendMessageOnEnterKey: React.KeyboardEventHandler<
        HTMLTextAreaElement
    > = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <form
            onSubmit={sendMessage}
            className="flex items-stretch gap-2 h-full px-2 pt-2"
        >
            <textarea
                placeholder="Aa"
                ref={messageRef}
                autoComplete="off"
                autoFocus
                onKeyDown={sendMessageOnEnterKey}
                className="w-full py-1 px-2 outline-none border border-gray-400"
            />
            <button className="w-[80px] bg-[#f1f1f5] border border-gray-400 p-2 active:bg-[#e1e1e5]">
                Send
            </button>
        </form>
    );
}
