import { SERVER_URL } from "@/lib/constants";
import { WsPayload } from "@/lib/types";
import {
  createContext,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";

type WebsocketContextType = {
  alive: boolean;
  data: WsPayload;
  sendData: (data: string) => void;
};

const def: WebsocketContextType = {
  alive: false,
  data: null,
  sendData: (data: string) => console.log("Sending ws data", data),
};

export const WebsocketContext = createContext<WebsocketContextType>(def);

export default function WebsocketProvider({ children }: PropsWithChildren) {
  const [alive, setAlive] = useState(def.alive);
  const [data, setData] = useState<WsPayload>(def.data);

  const ws = useRef<WebSocket>();

  useEffect(() => {
    // The browser's WebSocket API doesnot allow adding Authorization headers,
    // Thus we send it as a query param
    // More: https://stackoverflow.com/questions/4361173/http-headers-in-websockets-client-api
    const url = `${SERVER_URL}/ws?jwt=${localStorage.getItem("jwt")}`;
    const socket = new WebSocket(url);
    socket.onopen = () => {
      console.log("Opened websocket connection!");
      setAlive(true);
    };
    socket.onclose = () => {
      console.log("Closed websocket connection!");
      setAlive(false);
    };
    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
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

  // Function exposed for sending message
  const sendData = ws.current ? ws.current.send.bind(ws.current) : def.sendData;

  return (
    <WebsocketContext.Provider value={{ alive, data, sendData }}>
      {children}
    </WebsocketContext.Provider>
  );
}
