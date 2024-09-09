import {
    PropsWithChildren,
    createContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { WsPayload } from "../types/WsPayload";

type WebsocketContextType = {
    readonly wsIsOpen: boolean;
    readonly wsData: WsPayload | undefined;
    readonly wsSend: WebSocket["send"] | undefined;
};

const def = { wsIsOpen: false, wsData: undefined, wsSend: undefined };

export const WebsocketContext = createContext<WebsocketContextType>(def);

export function WebsocketProvider({ children }: PropsWithChildren) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<WsPayload>();
    const ws: React.MutableRefObject<WebSocket | null> = useRef(null);

    useEffect(() => {
        const socketProtocol = location.protocol === "https:" ? "wss" : "ws";
        const socket = new WebSocket(`${socketProtocol}://${location.host}/ws`);

        socket.onopen = () => {
            console.log("Opened ws connection");
            setOpen(true);
        };
        socket.onclose = () => {
            console.log("Closed ws connection");
            setOpen(false);
        };
        socket.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data) as WsPayload;
                console.log("Got ws data:", parsed);
                setData(parsed);
            } catch (err) {
                console.log("Error parsing ws msg as json", err);
            }
        };

        ws.current = socket;

        return () => {
            socket.close();
        };
    }, []);

    const ret = {
        wsIsOpen: open,
        wsData: data,
        wsSend: ws.current?.send.bind(ws.current),
    };

    return (
        <WebsocketContext.Provider value={ret}>
            {children}
        </WebsocketContext.Provider>
    );
}
