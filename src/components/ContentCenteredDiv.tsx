import { PropsWithChildren } from "react";

export default function ContentCenteredDiv({
    children,
    ...rest
}: PropsWithChildren) {
    return (
        <div
            {...rest}
            className="h-full w-full flex justify-center items-center"
        >
            {children}
        </div>
    );
}
