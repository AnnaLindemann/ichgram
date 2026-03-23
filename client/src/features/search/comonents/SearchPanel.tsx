import { useEffect, useMemo, useState } from "react";
import { searchUsers } from "../api/search.api";
import type { SearchUser } from "../types/search-user.types";

type SearchPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; users: SearchUser[] }
  | { status: "error"; message: string };

export function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setState({ status: "idle" });
      return;
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setState({ status: "idle" });
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setState({ status: "loading" });

      try {
        const result = await searchUsers(trimmedQuery);

        if (!result.ok) {
          setState({ status: "error", message: result.error });
          return;
        }

        if (result.data.length === 0) {
          setState({ status: "empty" });
          return;
        }

        setState({ status: "ready", users: result.data });
      } catch {
        setState({ status: "error", message: "Failed to search users" });
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, query]);

  const content = useMemo(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      return (
        <>
          <h3 className="mb-6 text-[16px] font-semibold text-black">Recent</h3>
          <div />
        </>
      );
    }

    if (state.status === "loading") {
      return (
        <div className="pt-2 text-[14px] text-[#8e8e8e]">Searching...</div>
      );
    }

    if (state.status === "error") {
      return (
        <div className="pt-2 text-[14px] text-red-500">{state.message}</div>
      );
    }

    if (state.status === "empty") {
      return (
        <div className="pt-2 text-[14px] text-[#8e8e8e]">No users found.</div>
      );
    }

    if (state.status === "ready") {
      return (
        <div className="space-y-1">
          {state.users.map((user) => (
            <div key={user.id} className="flex items-center gap-3 py-2">
              <div className="h-14 w-14 overflow-hidden rounded-full bg-[#d9d9d9]">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0">
                <p className="truncate text-[16px] font-semibold text-black">
                  {user.username}
                </p>
                {user.fullName ? (
                  <p className="truncate text-[14px] text-[#8e8e8e]">
                    {user.fullName}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  }, [query, state]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close search panel"
        onClick={onClose}
        className="fixed inset-y-0 left-64 right-0 z-40 hidden bg-black/50 lg:block"
      />

      <aside className="fixed inset-y-0 left-64 z-50 hidden w-[368px] rounded-tr-[30px] border-r border-[#dbdbdb] bg-white lg:block">
        <div className="flex h-full flex-col px-6 pt-6">
          <h2 className="mb-8 text-[32px] font-bold leading-none text-black">
            Search
          </h2>

          <div className="mb-8 flex h-10 items-center rounded-[8px] bg-[#efefef] px-4">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-[16px] text-black outline-none placeholder:text-[#8e8e8e]"
            />

            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="ml-3 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#c7c7c7] text-[10px] leading-none text-white"
            >
              ×
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-6">{content}</div>
        </div>
      </aside>
    </>
  );
}