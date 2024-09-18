import { User } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function UserIcon({
  className,
  user,
  ...props
}: {
  user: User;
  className?: string;
}) {
  const letters = user.fullname.split(" ").map((s) => s[0].toUpperCase());
  return (
    // <div className="w-[43px] h-[43px] rounded-[50%] flex justify-center items-center bg-foreground">
    <div
      {...props}
      className={cn(
        "w-[40px] h-[40px] bg-secondary rounded-[50%] flex justify-center items-center border border-black",
        className,
      )}
    >
      {letters.map((l) => l)}
    </div>
    // </div>
  );
}
