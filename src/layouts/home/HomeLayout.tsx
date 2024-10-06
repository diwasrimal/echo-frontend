import NavBar from "@/components/NavBar";
import { Toaster } from "@/components/ui/toaster";
import ChatPartnersProvider from "@/contexts/ChatPartnersProvider";
import WebsocketProvider from "@/contexts/WebsocketProvider";
import { Outlet } from "react-router-dom";
import ChatArea from "./ChatArea";

export default function HomeLayout() {
  return (
    <div className="h-screen max-w-[1536px] m-auto p-2">
      <div className="border rounded-md flex h-full">
        <div className="flex flex-col">
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
            <div className="hidden sm:w-[200px] sm:block lg:w-[300px] flex-shrink-0 h-full border-l">
              <Outlet />
            </div>
            <div className="flex-grow h-full border-l">
              <ChatArea />
            </div>
          </ChatPartnersProvider>
        </WebsocketProvider>
      </div>
      <Toaster />
    </div>
  );
}
