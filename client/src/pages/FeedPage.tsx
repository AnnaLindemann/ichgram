import { useEffect, useState } from "react";
import { getPosts, type PostDto } from "../features/feed/feed.api";

type UiState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; posts: PostDto[] };

export default function FeedPage() {
  const [state, setState] = useState<UiState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setState({ status: "loading" });
      try {
        const resp = await getPosts();
        if (!isMounted) return;

        if (!resp.ok) {
          setState({ status: "error", message: resp.error });
          return;
        }

        if (resp.data.length === 0) {
          setState({ status: "empty" });
          return;
        }

        setState({ status: "ready", posts: resp.data });
      } catch (e) {
        if (!isMounted) return;
        setState({ status: "error", message: "Network error" });
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (state.status === "loading") return <div className="p-4">Loading…</div>;
  if (state.status === "error") return <div className="p-4">Error: {state.message}</div>;
  if (state.status === "empty") return <div className="p-4">No posts yet</div>;

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-3">
        {state.posts.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-xl border">
            <div className="aspect-square w-full bg-muted">
              {/* Replace with proper <img> once you confirm imageUrl format */}
              <img
                src={p.imageUrl}
                alt={p.caption ?? "Post image"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-3 text-sm">
              <p className="line-clamp-2">{p.caption ?? ""}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="pt-6 text-center text-sm text-muted-foreground">
        You&apos;ve seen all the updates
      </div>
    </div>
  );
}