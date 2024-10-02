import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export default function ContentCenteredDiv({
  className,
  ...rest
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "h-full w-full flex justify-center items-center",
        className,
      )}
      {...rest}
    />
  );
}
