import { FormEvent, useRef, useState } from "react";
import { LabeledInput } from "../components/Input";
import { Button } from "../components/Button";
import { NavLink, Navigate } from "react-router-dom";
import ContentCenteredDiv from "../components/ContentCenteredDiv";
import { makePayload } from "../utils/utils";

export default function RegisterPage() {
    const fullnameRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confPasswordRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [errMsg, setErrMsg] = useState("");

    function handleRegister(e: FormEvent) {
        e.preventDefault();
        const fullname = fullnameRef.current!.value.trim();
        const username = usernameRef.current!.value.trim();
        const password = passwordRef.current!.value;
        const confirmPassword = confPasswordRef.current!.value;
        if (!fullname || !username || !password || !confirmPassword) {
            setErrMsg("Must provide all data");
            return;
        }
        if (username.indexOf(" ") > 0) {
            setErrMsg("Username cannot contain space");
            return;
        }
        if (password !== confirmPassword) {
            setErrMsg("Passwords do not match!");
            return;
        }
        setLoading(true);
        fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullname, username, password }),
        })
            .then((res) => makePayload(res))
            .then((payload) => {
                if (payload.ok) {
                    setRegistered(true);
                } else {
                    setErrMsg(payload.message);
                }
            })
            .catch((err) => console.error("Error in POST /api/register:", err))
            .finally(() => setLoading(false));
    }

    if (loading) return <ContentCenteredDiv>Loading...</ContentCenteredDiv>;
    if (registered) return <Navigate to="/login" />;

    return (
        <div className="min-w-[300px] w-[50%] h-[100vh] m-auto flex flex-col gap-4 items-center justify-center">
            <h1 className="font-bold">Register to Chat</h1>
            {errMsg && <p className="text-red-400">{errMsg}</p>}
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <LabeledInput
                    label="Full Name"
                    ref={fullnameRef}
                    id="fullname"
                    type="text"
                    placeholder="ex: John Doe"
                    autoComplete="off"
                    autoFocus
                    required
                />
                <LabeledInput
                    label="Username"
                    type="text"
                    id="username"
                    autoComplete="off"
                    placeholder="ex: johndoe24"
                    ref={usernameRef}
                    required
                />
                <LabeledInput
                    label="Password"
                    type="password"
                    id="password"
                    ref={passwordRef}
                    required
                />
                <LabeledInput
                    label="Confirm Password"
                    type="password"
                    id="confirm-password"
                    ref={confPasswordRef}
                    required
                />
                <Button>Register</Button>
            </form>
            <p>
                Already have an account? Go to{" "}
                <NavLink to="/login">Login</NavLink>
            </p>
        </div>
    );
}
