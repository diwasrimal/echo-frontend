import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import App from "./App.tsx";
import Error404 from "./components/Error404.tsx";
import Logout from "./components/Logout.tsx";
import AuthProvider from "./contexts/AuthProvider.tsx";
import { ThemeProvider } from "./contexts/ThemeProvider.tsx";
import "./index.css";
import GetStartedLayout from "./layouts/get-started/GetStartedLayout.tsx";
import Login from "./layouts/get-started/Login.tsx";
import Register from "./layouts/get-started/Register.tsx";
import Conversations from "./layouts/home/Conversations.tsx";
import HomeLayout from "./layouts/home/HomeLayout.tsx";
import People from "./layouts/home/People.tsx";
import ProtectedRoute from "./wrappers/ProtectedRoute.tsx";
import SessionCleaner from "./wrappers/SessionCleaner.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error404 />,
  },
  {
    path: "get-started",
    element: <GetStartedLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/get-started/login" />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
  {
    path: "home",
    element: (
      <ProtectedRoute>
        <HomeLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/home/conversations" />,
      },
      {
        path: "conversations",
        element: <Conversations />,
      },
      {
        path: "people",
        element: <People />,
      },
    ],
  },
  {
    path: "logout",
    element: <Logout />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SessionCleaner>
      <AuthProvider>
        <ThemeProvider defaultTheme="system">
          <RouterProvider router={router} />
        </ThemeProvider>
      </AuthProvider>
    </SessionCleaner>
  </StrictMode>,
);
