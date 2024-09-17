import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Login from "./layouts/get-started/Login.tsx";
import GetStartedLayout from "./layouts/get-started/GetStartedLayout.tsx";
import Register from "./layouts/get-started/Register.tsx";
import AuthProvider from "./contexts/AuthProvider.tsx";
import ProtectedRoute from "./wrappers/ProtectedRoute.tsx";
import Logout from "./components/Logout.tsx";
import useAuth from "./hooks/useAuth.tsx";
import Home from "@/components/Home.tsx";

const router = createBrowserRouter([
  {
    // path: "/",
    index: true,
    element: <App />,
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
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "logout",
    element: <Logout />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
