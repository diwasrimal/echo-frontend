import { useEffect, useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import Typewriter from "./Typewriter";

// Initial loading screen that is shown during startup
export default function LoadingScreen() {
  const [showSpinner, setShowSpinner] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const id1 = setTimeout(() => setShowSpinner(true), 420);
    const id2 = setTimeout(
      () => setMsg("Initial load might take some time..."),
      5000,
    );
    return () => {
      clearTimeout(id1);
      clearTimeout(id2);
    };
  }, []);

  return (
    <div className="h-screen flex justify-center items-center gap-4">
      <h2 className="text-3xl font-bold text-red-700">
        <Typewriter delay={80} text="echo" />
      </h2>
      {showSpinner && <LoadingSpinner size={32} className="text-red-700" />}
      {msg && <p>{msg}</p>}
    </div>
  );
}
