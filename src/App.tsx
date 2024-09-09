import { useEffect } from "react";
import {
    Navigate,
    RouterProvider,
    createBrowserRouter,
} from "react-router-dom";
import Logout from "./components/Logout";
import People from "./components/People";
import RecentConversations from "./components/RecentConversations";
import Requests from "./components/Requests";
import BaseLayout from "./layouts/BaseLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { WebsocketProvider } from "./contexts/WebsocketProvider";
import Friends from "./components/Friends";

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <WebsocketProvider>
                <BaseLayout />
            </WebsocketProvider>
        ),
        errorElement: <h1>Error!</h1>,
        children: [
            {
                index: true,
                element: <Navigate to="/chats" />,
            },
            {
                path: "chats",
                element: <RecentConversations />,
            },
            {
                path: "/people",
                element: <People />,
            },
            {
                path: "/requests",
                element: <Requests />,
            },
            {
                path: "/friends",
                element: <Friends />,
            },
        ],
    },
    { path: "/logout", element: <Logout /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
]);

export default function App() {
    useEffect(() => {
        return () => sessionStorage.clear();
    }, []);
    return <RouterProvider router={router} />;
}
