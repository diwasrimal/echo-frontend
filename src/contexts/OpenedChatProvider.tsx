import { User } from "@/lib/types";
import { createContext, PropsWithChildren, useState } from "react";

type OpenedChatContextType = {
  partner: User | null; // Partner associated with chat that's open
  setPartner: (partner: User) => void;
};

const def: OpenedChatContextType = {
  partner: null,
  setPartner: () => {},
};

export const OpenedChatContext = createContext<OpenedChatContextType>(def);

export function OpenedChatProvider({ children }: PropsWithChildren) {
  const [partner, setPartner] = useState(() => {
    const data = localStorage.getItem("openedChatPartner");
    return data ? (JSON.parse(data) as User) : null;
  });

  const value = {
    partner,
    setPartner: (partner: User) => {
      localStorage.setItem("openedChatPartner", JSON.stringify(partner));
      setPartner(partner);
    },
  };

  return (
    <OpenedChatContext.Provider value={value}>
      {children}
    </OpenedChatContext.Provider>
  );
}
