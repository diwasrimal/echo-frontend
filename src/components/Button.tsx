import { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button">;

export function Button({ children, ...rest }: ButtonProps) {
    return (
        <button {...rest} className="bg-[#f1f1f5] p-2 active:bg-[#e1e1e5]">
            {children}
        </button>
    );
}
