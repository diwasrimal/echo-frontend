import { PropsWithChildren, createContext, useEffect, useState } from "react";
import User from "../types/User";

type ActiveChatPartnerContextType = {
    activeChatPartner: User | undefined;
    setActiveChatPartner:
        | React.Dispatch<React.SetStateAction<User | undefined>>
        | undefined;
};

export const ActiveChatPartnerContext =
    createContext<ActiveChatPartnerContextType>({
        activeChatPartner: undefined,
        setActiveChatPartner: undefined,
    });

export function ActiveChatPartnerProvider({ children }: PropsWithChildren) {
    const [partner, setPartner] = useState<User | undefined>(() => {
        const data = localStorage.getItem("activeChatPartner");
        return data ? (JSON.parse(data) as User) : undefined;
    });

    // Store to localStorage if changed
    useEffect(() => {
        partner &&
            localStorage.setItem("activeChatPartner", JSON.stringify(partner));
    }, [partner]);

    return (
        <ActiveChatPartnerContext.Provider
            value={{
                activeChatPartner: partner,
                setActiveChatPartner: setPartner,
            }}
        >
            {children}
        </ActiveChatPartnerContext.Provider>
    );
}
