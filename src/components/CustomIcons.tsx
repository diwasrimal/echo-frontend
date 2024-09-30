import { UserRoundX, ArrowRight, UserRound, ArrowLeft } from "lucide-react";

export function UserRoundXArrowRight({ size = 20 }: { size: number }) {
  return (
    <div className="flex items-center justify-center relative">
      <UserRoundX size={size} />
      <ArrowRight
        size={size * 0.5}
        className="font-bold p-0 absolute left-[0.87rem] bottom-[0.4rem] stroke-[3]"
      />
    </div>
  );
}

export function UserRoundArrowLeft({ size = 20 }: { size: number }) {
  return (
    <div className="flex items-center justify-center relative">
      <UserRound size={size} />
      <ArrowLeft
        size={size * 0.5}
        className="font-bold p-0 absolute left-[0.92rem] bottom-[0.4rem] stroke-[3]"
      />
    </div>
  );
}
