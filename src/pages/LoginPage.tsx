import { FormEvent, useRef, useState } from "react";
import { LabeledInput } from "../components/Input";
import { Button } from "../components/Button";
import ContentCenteredDiv from "../components/ContentCenteredDiv";
import { makePayload, saveLoggedInUserId } from "../utils/utils";
import { NavLink, Navigate } from "react-router-dom";

export default function LoginPage() {
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const [loggedIn, setLoggedIn] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [loading, setLoading] = useState(false);

    function handleLogin(e: FormEvent) {
        e.preventDefault();
        const username = usernameRef.current!.value.trim();
        const password = passwordRef.current!.value;
        setLoading(true);
        fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        })
            .then((res) => makePayload(res))
            .then((payload) => {
                if (payload.ok) {
                    setLoggedIn(true);
                    saveLoggedInUserId(payload.userId);
                } else {
                    setErrMsg(payload.message);
                }
            })
            .catch((err) => console.error("Error: POST /api/login:", err))
            .finally(() => setLoading(false));
    }

    if (loading) return <ContentCenteredDiv>Loading...</ContentCenteredDiv>;
    if (loggedIn) return <Navigate to="/" />;

    return (
        <div className="min-w-[300px] w-[50%] h-[100vh] m-auto flex flex-col gap-4 items-center justify-center">
            <h1 className="font-bold">Login to Chat</h1>
            {errMsg && <p className="text-red-400">{errMsg}</p>}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <LabeledInput
                    label="Username"
                    ref={usernameRef}
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    autoComplete="off"
                    autoFocus
                    required
                />
                <LabeledInput
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="off"
                    placeholder="Enter your password"
                    ref={passwordRef}
                />
                <Button>Login</Button>
            </form>
            <p>
                Don't have an account? Go to{" "}
                <NavLink to="/register">Register</NavLink>
            </p>
        </div>
    );
}
