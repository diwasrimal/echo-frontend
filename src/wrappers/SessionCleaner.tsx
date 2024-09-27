import { PropsWithChildren, useEffect } from "react";

export default function SessionCleaner({ children }: PropsWithChildren) {
  useEffect(() => {
    return () => {
      console.log("<SessionCleaner /> unmounted!");
      sessionStorage.clear();
    };
  }, []);
  return <>{children}</>;
}
