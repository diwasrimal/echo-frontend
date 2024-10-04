import { PropsWithChildren, useEffect } from "react";

export default function SessionCleaner({ children }: PropsWithChildren) {
  useEffect(() => {
    window.onbeforeunload = function () {
      sessionStorage.setItem("refresh-initiator", window.location.href);
    };
    window.onload = function () {
      if (
        window.location.href === sessionStorage.getItem("refresh-initiator")
      ) {
        console.log("Cleaning sessionStorage..");
        sessionStorage.clear();
      }
    };
  }, []);
  return <>{children}</>;
}
