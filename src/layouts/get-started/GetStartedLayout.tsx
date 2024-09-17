import Typewriter from "@/components/Typewriter";
import { Outlet } from "react-router-dom";

export default function GetStartedLayout() {
  return (
    <div className="flex container m-auto p-4 flex-col sm:flex-row min-h-screen gap-16 justify-center items-center">
      <div className="flex-1">
        <h1 className="text-red-700 text-7xl font-bold">
          <Typewriter text={"echo."} delay={180} />
        </h1>
        <h1 className="text-2xl font-bold">find all your chats in one place</h1>
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
