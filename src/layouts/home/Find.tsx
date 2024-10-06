import ContentCenteredDiv from "@/components/ContentCenteredDiv";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import UserList from "@/components/UserList";
import { SERVER_URL } from "@/lib/constants";
import { User, UserSearchMethod } from "@/lib/types";
import { debounce, makePayload } from "@/lib/utils";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

export default function Find() {
  // const [input, setInput] = useState<string>("");
  const [results, setResults] = useState<User[]>([]);
  const [unauthorized, setUnauthorized] = useState(false);
  const [searching, setSearching] = useState(false);

  const searchUser = useMemo(() => {
    return debounce((type: UserSearchMethod, query: string) => {
      if (query.length === 0) return;
      const params = new URLSearchParams([
        ["type", type],
        ["query", query],
      ]);
      setSearching(true);
      const url = `${SERVER_URL}/api/search?${params}`;
      fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      })
        .then((res) => makePayload(res))
        .then((payload) => {
          console.log(`Payload for ${url}:`, payload);
          if (payload.ok) {
            setResults(payload.results || []);
          } else {
            setUnauthorized(payload.status === 401);
            throw new Error(payload.message || "Unknown error");
          }
        })
        .catch((err) => console.log(`Error fetching ${url}: ${err}`))
        .finally(() => setSearching(false));
    }, 250);
  }, []);

  if (unauthorized) return <Navigate to="/get-started" />;

  return (
    <div className="overflow-auto h-full flex flex-col">
      <div className="flex-shrink-0 h-[60px] flex items-center justify-center border-b p-2">
        <h1 className="text-xl font-bold">Find People</h1>
      </div>
      {/* Search box */}
      <div className="px-2 py-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <Search size={20} />
          </span>
          <Input
            className="pl-8 pr-8"
            placeholder="Search @username or just name..."
            onChange={(e) => {
              let query = e.target.value.trim();
              if (!query) return;
              let searchType: UserSearchMethod;
              if (query.startsWith("@")) {
                query = query.substring(1);
                searchType = "by-username";
              } else {
                searchType = "normal";
              }
              searchUser(searchType, query);
            }}
          />
          {searching && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
              <LoadingSpinner />
            </span>
          )}
        </div>
      </div>
      {/* Search results */}
      {results.length > 0 ? (
        <UserList users={results} showActions={true} className="px-2" />
      ) : (
        <ContentCenteredDiv>No results!</ContentCenteredDiv>
      )}
    </div>
  );
}
