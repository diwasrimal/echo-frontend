import ContentCenteredDiv from "@/components/ContentCenteredDiv";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { User, UserSearchMethod } from "@/lib/types";
import { Search } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";

export default function Connections() {
  // const [results, setResults] = useState<User[]>([]);
  // const [unauthorized, setUnauthorized] = useState(false);
  // const [searching, setSearching] = useState(false);

  // if (unauthorized) return <Navigate to="/get-started" />;

  return (
    <div className="overflow-auto h-full flex flex-col">
      <div className="flex-shrink-0 h-[60px] flex items-center justify-center border-b p-2">
        <h1 className="text-xl font-bold">Find People</h1>
      </div>
      <div className="px-2 py-4">Hello</div>
    </div>
  );
}
