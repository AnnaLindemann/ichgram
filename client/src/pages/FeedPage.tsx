import { useEffect, useState } from "react";
import { getPosts } from "../features/feed/api/feed.api";
import { mapPostDtoToFeedPost } from "../features/feed/api/map-post";
import { FeedPostCard } from "../features/feed/components/FeedPostCard";
import type { FeedPost } from "../features/feed/types/feed-post.types";
import allUpdates from "../assets/icons/allUpdates.svg";
import { FeedPostCardSkeleton } from "../features/feed/components/FeedPostCardSkeleton";

type UiState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; posts: FeedPost[] };

export default function FeedPage() {
  const [state, setState] = useState<UiState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setState({ status: "loading" });

      try {
        const resp = await getPosts();

        if (!isMounted) {
          return;
        }

        if (!resp.ok) {
          setState({ status: "error", message: resp.error });
          return;
        }

        if (resp.data.length === 0) {
          setState({ status: "empty" });
          return;
        }

        setState({
          status: "ready",
          posts: resp.data.map(mapPostDtoToFeedPost),
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setState({ status: "error", message: "Network error" });
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 gap-y-8 md:justify-center lg:grid-cols-[repeat(2,470px)] lg:justify-start lg:gap-x-9">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-full lg:w-[470px]">
              <FeedPostCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return <div className="p-4">Error: {state.message}</div>;
  }

  if (state.status === "empty") {
    return <div className="p-4">No posts yet</div>;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-y-8 md:justify-center lg:grid-cols-[repeat(2,470px)] lg:justify-start lg:gap-x-9">
        {state.posts.map((post) => (
          <div key={post.id} className="w-full lg:w-[470px]">
            <FeedPostCard post={post} />
          </div>
        ))}

        <div className="mt-4 flex flex-col items-center text-center lg:col-span-2 lg:w-[979px]">
          <img src={allUpdates} alt="All updates" className="mb-4 h-12 w-12" />

          <h3 className="text-[28px] font-semibold leading-tight text-black">
            You&apos;ve seen all the updates
          </h3>

          <p className="mt-2 text-base text-gray-500">
            You have viewed all new publications
          </p>
        </div>
      </div>
    </div>
  );
}