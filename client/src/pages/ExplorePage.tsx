import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExplorePosts } from "@/features/expoler/api/getExplorePosts";
import type { ExplorePost } from "@/features/expoler/types/explore.types";
import { resolveMediaUrl } from "@/shared/lib/resolveMediaUrl";

type ExploreState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; posts: ExplorePost[] };

function ExploreCard({
  post,
  onClick,
}: {
  post: ExplorePost;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-[2px] block w-full break-inside-avoid overflow-hidden bg-[#f5f5f5] text-left"
      aria-label="Open post"
    >
     <img
  src={resolveMediaUrl(post.imageUrl)}
        alt={post.caption || "Explore post"}
        className="block w-full object-cover"
        loading="lazy"
      />
    </button>
  );
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const [state, setState] = useState<ExploreState>({ status: "loading" });

  useEffect(() => {
    let isActive = true;

    async function loadExplorePosts() {
      setState({ status: "loading" });

      try {
        const posts = await getExplorePosts();

        if (!isActive) {
          return;
        }

        if (posts.length === 0) {
          setState({ status: "empty" });
          return;
        }

        setState({ status: "ready", posts });
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Failed to load explore posts";

        setState({ status: "error", message });
      }
    }

    void loadExplorePosts();

    return () => {
      isActive = false;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <section className="mx-auto w-full max-w-[935px] px-[2px] py-6">
        <p className="text-sm text-[#8e8e8e]">Loading explore posts...</p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="mx-auto w-full max-w-[935px] px-[2px] py-6">
        <p className="text-sm text-red-500">{state.message}</p>
      </section>
    );
  }

  if (state.status === "empty") {
    return (
      <section className="mx-auto w-full max-w-[935px] px-[2px] py-6">
        <p className="text-sm text-[#8e8e8e]">No explore posts yet.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[935px] px-[2px] py-6">
      <div className="columns-2 gap-[2px] md:columns-3">
        {state.posts.map((post) => (
          <ExploreCard
            key={post.id}
            post={post}
            onClick={() => navigate(`/posts/${post.id}`)}
          />
        ))}
      </div>
    </section>
  );
}