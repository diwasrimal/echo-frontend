import { useEffect, useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import Typewriter from "./Typewriter";

// Initial loading screen that is shown during startup
export default function LoadingScreen() {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setShowSpinner(true);
    }, 420);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="h-screen flex justify-center items-center gap-4">
      <h2 className="text-3xl font-bold text-red-700">
        <Typewriter delay={80} text="echo" />
      </h2>
      {showSpinner && <LoadingSpinner size={32} className="text-red-700" />}
    </div>
  );
}
