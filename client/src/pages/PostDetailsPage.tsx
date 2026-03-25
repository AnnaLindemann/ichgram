import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, MessageCircle } from "lucide-react";

import { fetchMyProfile } from "@/store/slices/profileSlice";
import { deletePost } from "@/features/posts/api/posts.api";
import {
  followUserById,
  unfollowUserById,
  getPostById,
  type ProfilePostDetailsData,
} from "@/features/profile/api/profile.api";
import {
  likePostById,
  unlikePostById,
} from "@/features/posts/api/post-likes.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { applyFollowState } from "@/store/slices/profileSlice";
import { seedFollowRelations, setFollowRelation } from "@/store/slices/followsSlice";
import { seedPostLikes, setPostLikeState } from "@/store/slices/postLikesSlice";

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
  const dispatch = useAppDispatch();

  const currentProfile = useAppSelector((state) => state.profile.currentProfile);
  const followRelations = useAppSelector((state) => state.follows.relations);
  const likedByPostId = useAppSelector((state) => state.postLikes.likedByPostId);
  const likesCountByPostId = useAppSelector(
    (state) => state.postLikes.likesCountByPostId,
  );

  const [post, setPost] = useState<ProfilePostDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingFollow, setIsSubmittingFollow] = useState(false);
  const [isSubmittingLike, setIsSubmittingLike] = useState(false);

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

          dispatch(
            seedFollowRelations([
              {
                userId: data.author.id,
                isFollowing: data.isFollowingAuthor ?? false,
              },
            ]),
          );

          dispatch(
            seedPostLikes([
              {
                postId: data.id,
                likedByMe: data.likedByMe,
                likesCount: data.likesCount,
              },
            ]),
          );
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

    return () => {
      controller.abort();
    };
  }, [id, dispatch]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (isActionsOpen) {
        if (!isDeleting) {
          setIsActionsOpen(false);
        }
        return;
      }

      if (!isDeleting && !isSubmittingFollow && !isSubmittingLike) {
        navigate(-1);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [navigate, isActionsOpen, isDeleting, isSubmittingFollow, isSubmittingLike]);

  const handleClose = () => {
    if (isDeleting || isSubmittingFollow || isSubmittingLike) {
      return;
    }

    navigate(-1);
  };

  const handleCloseActions = () => {
    if (isDeleting) {
      return;
    }

    setIsActionsOpen(false);
  };

  const handleGoToPost = () => {
    setIsActionsOpen(false);
  };

  const handleCopyLink = async () => {
    if (!post) {
      return;
    }

    const postUrl = `${window.location.origin}/posts/${post.id}`;

    try {
      await navigator.clipboard.writeText(postUrl);
      setIsActionsOpen(false);
    } catch {
      setIsActionsOpen(false);
    }
  };

  const handleEditPost = () => {
    if (!post) {
      return;
    }

    navigate(`/posts/${post.id}/edit`);
  };

  const handleDeletePost = async () => {
    if (!post || isDeleting) {
      return;
    }

    setIsDeleting(true);

    const result = await deletePost(post.id);

    if (!result.ok) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    await dispatch(fetchMyProfile());

    navigate(-1);
  };

  const handleFollowToggle = async () => {
    if (!post || isSubmittingFollow) {
      return;
    }

    if (currentProfile?.user.id === post.author.id) {
      return;
    }

    setIsSubmittingFollow(true);
    setError("");

    const isFollowingAuthor =
      followRelations[post.author.id] ?? post.isFollowingAuthor ?? false;

    if (isFollowingAuthor) {
      const result = await unfollowUserById(post.author.id);

      if (!result.ok) {
        setError(result.error);
        setIsSubmittingFollow(false);
        return;
      }

      dispatch(setFollowRelation({ userId: post.author.id, isFollowing: false }));

      dispatch(
        applyFollowState({
          targetUserId: post.author.id,
          isFollowing: false,
        }),
      );
    } else {
      const result = await followUserById(post.author.id);

      if (!result.ok) {
        setError(result.error);
        setIsSubmittingFollow(false);
        return;
      }

      dispatch(setFollowRelation({ userId: post.author.id, isFollowing: true }));

      dispatch(
        applyFollowState({
          targetUserId: post.author.id,
          isFollowing: true,
        }),
      );
    }

    setIsSubmittingFollow(false);
  };

  const handleLikeToggle = async () => {
    if (!post || isSubmittingLike) {
      return;
    }

    const currentLikedByMe = likedByPostId[post.id] ?? post.likedByMe;
    const currentLikesCount = likesCountByPostId[post.id] ?? post.likesCount;

    const optimisticLikedByMe = !currentLikedByMe;
    const optimisticLikesCount = optimisticLikedByMe
      ? currentLikesCount + 1
      : Math.max(0, currentLikesCount - 1);

    setError("");
    setIsSubmittingLike(true);

    dispatch(
      setPostLikeState({
        postId: post.id,
        likedByMe: optimisticLikedByMe,
        likesCount: optimisticLikesCount,
      }),
    );

    const result = currentLikedByMe
      ? await unlikePostById(post.id)
      : await likePostById(post.id);

    if (!result.ok) {
      dispatch(
        setPostLikeState({
          postId: post.id,
          likedByMe: currentLikedByMe,
          likesCount: currentLikesCount,
        }),
      );

      setError(result.error);
      setIsSubmittingLike(false);
      return;
    }

    dispatch(
      setPostLikeState({
        postId: post.id,
        likedByMe: result.liked,
        likesCount: result.likesCount,
      }),
    );

    setIsSubmittingLike(false);
  };

  const isOwner = currentProfile?.user.id === post?.author.id;
  const showFollowSection = !!post && !isOwner;

  const isFollowingAuthor = post
    ? (followRelations[post.author.id] ?? post.isFollowingAuthor ?? false)
    : false;

  const effectiveLikedByMe = post
    ? (likedByPostId[post.id] ?? post.likedByMe)
    : false;

  const effectiveLikesCount = post
    ? (likesCountByPostId[post.id] ?? post.likesCount)
    : 0;

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
          ) : error && !post ? (
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
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
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

                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-sm font-semibold text-black">
                        {post.author.username}
                      </span>

                      {showFollowSection ? (
                        <>
                          <span className="text-sm text-[#8e8e8e]">•</span>
                          {isFollowingAuthor ? (
                            <button
                              type="button"
                              onClick={handleFollowToggle}
                              disabled={isSubmittingFollow}
                              className="text-sm font-semibold text-[#8e8e8e] hover:text-black disabled:opacity-60"
                            >
                              {isSubmittingFollow ? "Unfollowing..." : "Following"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleFollowToggle}
                              disabled={isSubmittingFollow}
                              className="text-sm font-semibold text-[#0095f6] hover:text-[#1877f2] disabled:opacity-60"
                            >
                              {isSubmittingFollow ? "Following..." : "Follow"}
                            </button>
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>

                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => setIsActionsOpen(true)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-black transition hover:bg-black/5"
                      aria-label="Open post actions"
                    >
                      …
                    </button>
                  ) : null}
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

                  {error ? (
                    <p className="mt-4 text-sm text-red-500">{error}</p>
                  ) : null}
                </div>

                <div className="border-t px-4 py-3">
                  <div className="flex items-center gap-4 text-black">
                    <button
                      type="button"
                      onClick={handleLikeToggle}
                      disabled={isSubmittingLike}
                      aria-label={effectiveLikedByMe ? "Unlike post" : "Like post"}
                      className="text-left text-sm font-medium hover:opacity-70 disabled:opacity-60"
                    >
                      <Heart
                        className={`h-6 w-6 ${
                          effectiveLikedByMe ? "fill-red-500 text-red-500" : ""
                        }`}
                        strokeWidth={1.75}
                      />
                    </button>

                    <button
                      type="button"
                      className="text-left text-sm font-medium hover:opacity-70"
                    >
                      <MessageCircle className="h-6 w-6 scale-x-[-1]" strokeWidth={1.75} />
                    </button>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-black">
                    {effectiveLikesCount} likes
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
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
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

                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-sm font-semibold text-black">
                        {post.author.username}
                      </span>

                      {showFollowSection ? (
                        <>
                          <span className="text-sm text-[#8e8e8e]">•</span>
                          {isFollowingAuthor ? (
                            <button
                              type="button"
                              onClick={handleFollowToggle}
                              disabled={isSubmittingFollow}
                              className="text-sm font-semibold text-[#8e8e8e] hover:text-black disabled:opacity-60"
                            >
                              {isSubmittingFollow ? "Unfollowing..." : "Following"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleFollowToggle}
                              disabled={isSubmittingFollow}
                              className="text-sm font-semibold text-[#0095f6] hover:text-[#1877f2] disabled:opacity-60"
                            >
                              {isSubmittingFollow ? "Following..." : "Follow"}
                            </button>
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>

                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => setIsActionsOpen(true)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-black transition hover:bg-black/5"
                      aria-label="Open post actions"
                    >
                      …
                    </button>
                  ) : null}
                </div>

                <div className="flex-1 bg-black">
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="h-full max-h-[55vh] w-full object-cover"
                  />
                </div>

                <div className="border-t px-4 py-3">
                  <div className="flex items-center gap-4 text-black">
                    <button
                      type="button"
                      onClick={handleLikeToggle}
                      disabled={isSubmittingLike}
                      aria-label={effectiveLikedByMe ? "Unlike post" : "Like post"}
                      className="text-left text-sm font-medium hover:opacity-70 disabled:opacity-60"
                    >
                      <Heart
                        className={`h-6 w-6 ${
                          effectiveLikedByMe ? "fill-red-500 text-red-500" : ""
                        }`}
                        strokeWidth={1.75}
                      />
                    </button>

                    <button
                      type="button"
                      className="text-left text-sm font-medium hover:opacity-70"
                    >
                      <MessageCircle className="h-6 w-6 scale-x-[-1]" strokeWidth={1.75} />
                    </button>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-black">
                    {effectiveLikesCount} likes
                  </p>

                  <p className="mt-1 text-sm text-[#8e8e8e]">
                    {post.commentsCount} comments
                  </p>

                  <p className="mt-2 text-xs uppercase tracking-wide text-[#8e8e8e]">
                    {formatPostDate(post.createdAt)}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-black">
                    <span className="mr-2 font-semibold">
                      {post.author.username}
                    </span>
                    {post.caption || " "}
                  </p>

                  {error ? (
                    <p className="mt-4 text-sm text-red-500">{error}</p>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isActionsOpen && isOwner ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 px-4"
          onClick={handleCloseActions}
        >
          <div
            className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="flex h-12 w-full items-center justify-center border-b text-sm font-semibold text-red-500 hover:bg-black/[0.02] disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>

            <button
              type="button"
              onClick={handleEditPost}
              disabled={isDeleting}
              className="flex h-12 w-full items-center justify-center border-b text-sm text-black hover:bg-black/[0.02] disabled:opacity-60"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={handleGoToPost}
              disabled={isDeleting}
              className="flex h-12 w-full items-center justify-center border-b text-sm text-black hover:bg-black/[0.02] disabled:opacity-60"
            >
              Go to post
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              disabled={isDeleting}
              className="flex h-12 w-full items-center justify-center border-b text-sm text-black hover:bg-black/[0.02] disabled:opacity-60"
            >
              Copy link
            </button>

            <button
              type="button"
              onClick={handleCloseActions}
              disabled={isDeleting}
              className="flex h-12 w-full items-center justify-center text-sm text-black hover:bg-black/[0.02] disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}