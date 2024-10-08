import { PropsWithChildren, useEffect, useState } from "react";
import { createContext } from "react";

type SmallScreenContextType = {
  isSmallScreen: boolean;
  showOnlyChatColumn: boolean;
  setShowOnlyChatColumn: (v: boolean) => void;
};

export const SmallScreenContext = createContext<SmallScreenContextType>({
  isSmallScreen: false,
  showOnlyChatColumn: false,
  setShowOnlyChatColumn: () => {},
});

export function SmallScreenProvider({ children }: PropsWithChildren) {
  const [isSmall, setIsSmall] = useState(false);
  const [showOnlyChatColumn, setShowOnlyChatColumn] = useState(false);

  function handleWindowSizeChange() {
    const isSmall = window.innerWidth <= 640;
    setIsSmall(isSmall);
    if (!isSmall) {
      setShowOnlyChatColumn(false);
    }
  }

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  return (
    <SmallScreenContext.Provider
      value={{
        isSmallScreen: isSmall,
        showOnlyChatColumn,
        setShowOnlyChatColumn,
      }}
    >
      {children}
    </SmallScreenContext.Provider>
  );
}
