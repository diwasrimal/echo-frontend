import { useEffect, useState } from "react";
import ContentCenteredDiv from "./ContentCenteredDiv";
import { Navigate } from "react-router-dom";

export default function Logout() {
    const [ok, setOk] = useState(false);

    useEffect(() => {
        fetch("/api/logout", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }).then((res) => setOk(res.ok));
    }, []);

    if (ok) {
        sessionStorage.clear();
        localStorage.clear();
        return <Navigate to="/login" />;
    }

    return <ContentCenteredDiv>Logging out...</ContentCenteredDiv>;
}
