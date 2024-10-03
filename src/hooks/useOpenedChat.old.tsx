import { OpenedChatContext } from "@/contexts/OpenedChatProvider";
import { useContext } from "react";

export default function useOpenedChat() {
  const context = useContext(OpenedChatContext);

  if (context === undefined) {
    throw new Error("useOpenedChat must be used within an OpenedChatProvider");
  }

  return context;
}
