import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getPostById,
  type ProfilePostDetailsData,
} from "@/features/profile/api/profile.api";

function formatPostDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getInitial(username: string) {
  return username.trim().charAt(0).toUpperCase() || "U";
}

export default function PostDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<ProfilePostDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Post not found.");
      return;
    }

    const controller = new AbortController();

    const loadPost = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPostById(id);

        if (!controller.signal.aborted) {
          setPost(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Failed to load post.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadPost();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        navigate(-1);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      controller.abort();
      window.removeEventListener("keydown", handleEscape);
    };
  }, [id, navigate]);

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div
  className="fixed inset-0 z-50 bg-black/65 px-6 py-8 md:px-10 md:py-10"
  onClick={handleClose}
>
      <div className="flex h-full items-center justify-center">
        <div
  className="relative flex h-[min(78vh,640px)] w-full max-w-[980px] overflow-hidden rounded-md bg-white shadow-2xl"
  onClick={(event) => event.stopPropagation()}
>
        

          {loading ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Loading post...
            </div>
          ) : error ? (
            <div className="flex flex-1 items-center justify-center px-6 text-sm text-red-500">
              {error}
            </div>
          ) : !post ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Post not found.
            </div>
          ) : (
            <>
              <div className="min-w-0 flex-1 bg-black">
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="hidden w-full max-w-[420px] flex-col bg-white md:flex">
                <div className="flex items-center gap-3 border-b px-4 py-3">
                  {post.author.avatarUrl ? (
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                      {getInitial(post.author.username)}
                    </div>
                  )}

                  <span className="text-sm font-semibold text-black">
                    {post.author.username}
                  </span>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                  <div className="flex gap-3">
                    {post.author.avatarUrl ? (
                      <img
                        src={post.author.avatarUrl}
                        alt={post.author.username}
                        className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                        {getInitial(post.author.username)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-sm leading-6 text-black">
                        <span className="mr-2 font-semibold">
                          {post.author.username}
                        </span>
                        {post.caption || " "}
                      </p>

                      <p className="mt-2 text-xs uppercase tracking-wide text-[#8e8e8e]">
                        {formatPostDate(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2 text-sm text-[#8e8e8e]">
                    <p>{post.commentsCount} comments</p>
                  </div>
                </div>

                <div className="border-t px-4 py-3">
                  <div className="flex items-center gap-4 text-black">
                    <button
                      type="button"
                      className="text-left text-sm font-medium hover:opacity-70"
                    >
                      ♡
                    </button>

                    <button
                      type="button"
                      className="text-left text-sm font-medium hover:opacity-70"
                    >
                      💬
                    </button>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-black">
                    {post.likesCount} likes
                  </p>

                  <div className="mt-4 flex items-center gap-3 border-t pt-3">
                    <input
                      type="text"
                      placeholder="Add comment"
                      className="h-10 flex-1 border-0 bg-transparent text-sm text-black outline-none placeholder:text-[#8e8e8e]"
                    />

                    <button
                      type="button"
                      className="text-sm font-semibold text-[#0095f6] hover:text-[#1877f2]"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col bg-white md:hidden">
                <div className="flex items-center gap-3 border-b px-4 py-3">
                  {post.author.avatarUrl ? (
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                      {getInitial(post.author.username)}
                    </div>
                  )}

                  <span className="text-sm font-semibold text-black">
                    {post.author.username}
                  </span>
                </div>

                <div className="flex-1 bg-black">
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="h-full max-h-[55vh] w-full object-cover"
                  />
                </div>

                <div className="px-4 py-4">
                  <p className="text-sm leading-6 text-black">
                    <span className="mr-2 font-semibold">
                      {post.author.username}
                    </span>
                    {post.caption || " "}
                  </p>

                  <p className="mt-3 text-sm font-semibold text-black">
                    {post.likesCount} likes
                  </p>

                  <p className="mt-1 text-sm text-[#8e8e8e]">
                    {post.commentsCount} comments
                  </p>

                  <p className="mt-2 text-xs uppercase tracking-wide text-[#8e8e8e]">
                    {formatPostDate(post.createdAt)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}