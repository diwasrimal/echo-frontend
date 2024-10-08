import NavBar from "@/components/NavBar";
import { Toaster } from "@/components/ui/toaster";
import ChatPartnersProvider from "@/contexts/ChatPartnersProvider";
import WebsocketProvider from "@/contexts/WebsocketProvider";
import { Outlet } from "react-router-dom";
import ChatArea from "./ChatArea";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { SmallScreenContext } from "@/contexts/SmallScreenProvider";

export default function HomeLayout() {
  const { isSmallScreen, showOnlyChatColumn } = useContext(SmallScreenContext);

  return (
    <div className="h-screen max-w-[1536px] m-auto p-2">
      <div className="border rounded-md flex h-full">
        {/* First column (navbar) */}
        <div className={showOnlyChatColumn ? "hidden" : "flex flex-col"}>
          {/*Later convert to component maybe since all the titles in 3 columns use same height */}
          <div className="flex justify-center items-center h-[60px] border-b">
            <div className="h-3 w-3 bg-primary rounded-full"></div>
            <div className="h-2 w-2 bg-primary rounded-full"></div>
            <div className="h-1 w-1 bg-primary rounded-full"></div>
          </div>
          <div className="flex-grow">
            <NavBar />
          </div>
        </div>

        <WebsocketProvider>
          <ChatPartnersProvider>
            {/* Second column (conversations, find, ...) */}
            <div
              className={cn(
                "border-l h-full",
                isSmallScreen
                  ? "w-full"
                  : "sm:w-[250px] lg:w-[350px] flex-shrink-0 border-r",
                showOnlyChatColumn ? "hidden" : "block",
              )}
            >
              <Outlet />
            </div>

            {/* Third column (active chat) */}
            <div
              className={cn(
                showOnlyChatColumn || !isSmallScreen
                  ? "flex-grow h-full"
                  : "hidden",
              )}
            >
              <ChatArea />
            </div>
          </ChatPartnersProvider>
        </WebsocketProvider>
      </div>
      <Toaster />
    </div>
  );
}
