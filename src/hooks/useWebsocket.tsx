import { WebsocketContext } from "@/contexts/WebsocketProvider";
import { useContext } from "react";

export default function useWebsocket() {
  const context = useContext(WebsocketContext);

  if (context === undefined) {
    throw new Error("useWebsocket must be used within an WebsocketProvider");
  }

  return context;
}
