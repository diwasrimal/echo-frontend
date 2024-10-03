import { ChatPartnersContext } from "@/contexts/ChatPartnersProvider";
import { useContext } from "react";

export default function useChatPartners() {
  const context = useContext(ChatPartnersContext);

  if (context === undefined) {
    throw new Error(
      "useChatPartners must be used within an ChatPartnersProvider",
    );
  }

  return context;
}
