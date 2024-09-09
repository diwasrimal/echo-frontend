import { NavLink, Navigate, Outlet } from "react-router-dom";
import { getLoggedInUserId, makePayload } from "../utils/utils";
import { useEffect, useState } from "react";
import ContentCenteredDiv from "../components/ContentCenteredDiv";
import ActiveChat from "../components/ActiveChat";
import { ActiveChatPartnerProvider } from "../contexts/ActiveChatPairProvider";
import { ChatPartnersProvider } from "../contexts/ChatPartnersProvider";

import MessageCircleIcon from "../assets/message-circle.svg";
import SearchIcon from "../assets/search.svg";
import UsersIcon from "../assets/users.svg";
import LogoutIcon from "../assets/log-out.svg";
import ChevronsLeftIcon from "../assets/chevrons-left.svg";

export default function BaseLayout() {
    const [unauthorized, setUnauthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    // Redirects to login if unauthorized or no logged in user id stored in localStorage
    useEffect(() => {
        if (!getLoggedInUserId()) {
            setUnauthorized(true);
            setLoading(false);
            return;
        }
        fetch("/api/login-status", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => makePayload(res))
            .then((payload) => setUnauthorized(payload.statusCode === 401))
            .catch((err) => console.error("Error: GET /api/login-status:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <ContentCenteredDiv>Loading...</ContentCenteredDiv>;
    if (unauthorized) return <Navigate to="/login" />;

    return (
        <div className="h-[100vh] w-[100vw] flex p-2">
            <nav className="h-full w-[var(--nav-width)]">
                <NavList />
            </nav>
            <ChatPartnersProvider>
                <ActiveChatPartnerProvider>
                    <div className="w-[300px] border-l-2 border-r-2 pl-2 pr-2 overflow-scroll">
                        {/* Recent conversations or other people list will come here */}
                        <Outlet />
                    </div>
                    <div className="flex-1 pl-2 pr-2">
                        <ActiveChat />
                    </div>
                </ActiveChatPartnerProvider>
            </ChatPartnersProvider>
        </div>
    );
}

function NavList() {
    return (
        <div className="flex flex-col justify-between h-full w-full items-center pt-2 pb-2 pr-1">
            {/* These items at top */}
            <ul className="flex flex-col gap-4">
                <li>
                    <NavLink
                        to="/chats"
                        className={navClassNameSetter}
                        title="Chats"
                    >
                        <img src={MessageCircleIcon} className="w-[25px]" />
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/people"
                        className={navClassNameSetter}
                        title="Find People"
                    >
                        <img src={SearchIcon} className="w-[25px]" />
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/requests"
                        className={navClassNameSetter}
                        title="Requests"
                    >
                        <img src={ChevronsLeftIcon} className="w-[25px]" />
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/friends"
                        className={navClassNameSetter}
                        title="Friends"
                    >
                        <img src={UsersIcon} className="w-[25px]" />
                    </NavLink>
                </li>
            </ul>
            {/* Logout at bottom */}
            <NavLink to="/logout" title="logout">
                <img src={LogoutIcon} className="w-[25px]" />
            </NavLink>
        </div>
    );
}

function navClassNameSetter({ isActive }: { isActive: boolean }) {
    return isActive ? "text-green-300" : "";
}
