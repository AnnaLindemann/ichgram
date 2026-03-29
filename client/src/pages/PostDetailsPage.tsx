import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
import {
  createComment,
  deleteCommentById,
  getCommentsByPostId,
  updateCommentById,
} from "@/features/comments/api/comments.api";
import type { CommentDto } from "@/features/comments/types/comments.types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { applyFollowState } from "@/store/slices/profileSlice";
import {
  seedFollowRelations,
  setFollowRelation,
} from "@/store/slices/followsSlice";
import { seedPostLikes, setPostLikeState } from "@/store/slices/postLikesSlice";
import {
  decrementPostCommentsCount,
  incrementPostCommentsCount,
  seedPostComments,
} from "@/store/slices/postCommentsSlice";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { resolveMediaUrl } from "@/shared/lib/resolveMediaUrl";

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
  const commentsCountByPostId = useAppSelector(
    (state) => state.postComments.commentsCountByPostId,
  );

  const commentInputRef = useRef<HTMLInputElement | null>(null);

  const [post, setPost] = useState<ProfilePostDetailsData | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [savingCommentId, setSavingCommentId] = useState<string | null>(null);
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

          dispatch(
            seedPostComments([
              {
                postId: data.id,
                commentsCount: data.commentsCount,
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
    if (!id) {
      return;
    }

    let isMounted = true;

    const loadComments = async () => {
      setCommentsLoading(true);

      const result = await getCommentsByPostId(id);

      if (!isMounted) {
        return;
      }

      if (result.ok) {
        setComments(result.data);
      } else {
        setComments([]);
      }

      setCommentsLoading(false);
    };

    void loadComments();

    return () => {
      isMounted = false;
    };
  }, [id]);

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

      if (editingCommentId) {
        if (!savingCommentId) {
          setEditingCommentId(null);
          setEditingContent("");
        }
        return;
      }

      if (
        !isDeleting &&
        !isSubmittingFollow &&
        !isSubmittingLike &&
        !isSubmittingComment &&
        !deletingCommentId &&
        !savingCommentId
      ) {
        navigate(-1);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [
    navigate,
    isActionsOpen,
    isDeleting,
    isSubmittingFollow,
    isSubmittingLike,
    isSubmittingComment,
    editingCommentId,
    savingCommentId,
    deletingCommentId,
  ]);

  const handleClose = () => {
    if (
      isDeleting ||
      isSubmittingFollow ||
      isSubmittingLike ||
      isSubmittingComment ||
      deletingCommentId ||
      savingCommentId
    ) {
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

  const handleCommentIconClick = () => {
    commentInputRef.current?.focus();
  };

  const handleCommentSubmit = async () => {
    if (!post || isSubmittingComment) {
      return;
    }

    const trimmedComment = commentInput.trim();

    if (trimmedComment === "") {
      return;
    }

    setError("");
    setIsSubmittingComment(true);

    const result = await createComment(post.id, { content: trimmedComment });

    if (!result.ok) {
      setError(result.error);
      setIsSubmittingComment(false);
      return;
    }

    setComments((prev) => [...prev, result.data]);
    setCommentInput("");
    dispatch(incrementPostCommentsCount({ postId: post.id }));

    setIsSubmittingComment(false);
  };

  const handleStartEditComment = (comment: CommentDto) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setError("");
  };

  const handleCancelEditComment = () => {
    if (savingCommentId) {
      return;
    }

    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleSaveEditComment = async (commentId: string) => {
    const trimmedContent = editingContent.trim();

    if (trimmedContent === "" || savingCommentId) {
      return;
    }

    setError("");
    setSavingCommentId(commentId);

    const result = await updateCommentById(commentId, {
      content: trimmedContent,
    });

    if (!result.ok) {
      setError(result.error);
      setSavingCommentId(null);
      return;
    }

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? result.data : comment,
      ),
    );

    setEditingCommentId(null);
    setEditingContent("");
    setSavingCommentId(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post || deletingCommentId) {
      return;
    }

    setError("");
    setDeletingCommentId(commentId);

    const result = await deleteCommentById(commentId);

    if (!result.ok) {
      setError(result.error);
      setDeletingCommentId(null);
      return;
    }

    setComments((prev) => prev.filter((comment) => comment.id !== commentId));

    if (editingCommentId === commentId) {
      setEditingCommentId(null);
      setEditingContent("");
    }

    dispatch(decrementPostCommentsCount({ postId: post.id }));
    setDeletingCommentId(null);
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

const shouldShowLikedHeart = effectiveLikesCount > 0;

  const effectiveCommentsCount = post
    ? (commentsCountByPostId[post.id] ?? post.commentsCount)
    : 0;

      const authorProfilePath =
    post && currentProfile?.user.id === post.author.id
      ? "/profile"
      : post
        ? `/profile/${post.author.id}`
        : "/profile";

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
                  src={resolveMediaUrl(post.imageUrl)}
                  alt="Post"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="hidden w-full max-w-[420px] flex-col bg-white md:flex">
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                   <Link to={authorProfilePath} className="shrink-0">
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
</Link>

                    <div className="flex min-w-0 items-center gap-2">
                     <Link
  to={authorProfilePath}
  className="text-sm font-semibold text-black"
>
  {post.author.username}
</Link>

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
                       <Link
  to={authorProfilePath}
  className="mr-2 font-semibold"
>
  {post.author.username}
</Link>
                        {post.caption || " "}
                      </p>

                      <p className="mt-2 text-xs uppercase tracking-wide text-[#8e8e8e]">
                        {formatRelativeTime(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    {commentsLoading ? (
                      <p className="text-sm text-[#8e8e8e]">Loading comments...</p>
                    ) : comments.length === 0 ? (
                      <p className="text-sm text-[#8e8e8e]">No comments yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {comments.map((comment) => {
                          const isMyComment =
                            currentProfile?.user.id === comment.author.id;
                          const isEditing = editingCommentId === comment.id;
                          const isDeletingComment =
                            deletingCommentId === comment.id;
                          const isSavingComment = savingCommentId === comment.id;

                          return (
                            <div key={comment.id} className="flex gap-3">
                              {comment.author.avatarUrl ? (
                                <img
                                  src={comment.author.avatarUrl}
                                  alt={comment.author.username}
                                  className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
                                />
                              ) : (
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                                  {getInitial(comment.author.username)}
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                {isEditing ? (
                                  <>
                                    <div className="rounded-md border border-gray-200 bg-white px-3 py-2">
                                      <textarea
                                        value={editingContent}
                                        onChange={(event) =>
                                          setEditingContent(event.target.value)
                                        }
                                        rows={3}
                                        disabled={isSavingComment}
                                        className="w-full resize-none border-0 bg-transparent text-sm text-black outline-none disabled:opacity-60"
                                      />
                                    </div>

                                    <div className="mt-2 flex gap-3 text-xs">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          void handleSaveEditComment(comment.id);
                                        }}
                                        disabled={
                                          isSavingComment ||
                                          editingContent.trim() === ""
                                        }
                                        className="font-semibold text-[#0095f6] hover:text-[#1877f2] disabled:opacity-60"
                                      >
                                        {isSavingComment ? "Saving..." : "Save"}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={handleCancelEditComment}
                                        disabled={isSavingComment}
                                        className="text-[#8e8e8e] hover:text-black disabled:opacity-60"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm leading-6 text-black">
                                      <span className="mr-2 font-semibold">
                                        {comment.author.username}
                                      </span>
                                      {comment.content}
                                    </p>

                                    <p className="mt-1 text-xs uppercase tracking-wide text-[#8e8e8e]">
                                      {formatRelativeTime(comment.createdAt)}
                                    </p>

                                    {isMyComment ? (
                                      <div className="mt-1 flex gap-3 text-xs text-[#8e8e8e]">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleStartEditComment(comment)
                                          }
                                          disabled={Boolean(
                                            deletingCommentId || savingCommentId,
                                          )}
                                          className="hover:text-black disabled:opacity-60"
                                        >
                                          Edit
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            void handleDeleteComment(comment.id);
                                          }}
                                          disabled={isDeletingComment}
                                          className="hover:text-black disabled:opacity-60"
                                        >
                                          {isDeletingComment ? "Deleting..." : "Delete"}
                                        </button>
                                      </div>
                                    ) : null}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                      aria-label={shouldShowLikedHeart ? "Unlike post" : "Like post"}
                      className="text-left text-sm font-medium hover:opacity-70 disabled:opacity-60"
                    >
                     <Heart
  className={`h-6 w-6 ${
    shouldShowLikedHeart ? "fill-red-500 text-red-500" : ""
  }`}
  strokeWidth={1.75}
/>
                    </button>

                    <button
                      type="button"
                      onClick={handleCommentIconClick}
                      className="text-left text-sm font-medium hover:opacity-70"
                    >
                      <MessageCircle
                        className="h-6 w-6 scale-x-[-1]"
                        strokeWidth={1.75}
                      />
                    </button>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-black">
                    {effectiveLikesCount} likes
                  </p>

                  <div className="mt-4 flex items-center gap-3 border-t pt-3">
                    <input
                      ref={commentInputRef}
                      type="text"
                      value={commentInput}
                      onChange={(event) => setCommentInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleCommentSubmit();
                        }
                      }}
                      placeholder="Add comment"
                      disabled={isSubmittingComment}
                      className="h-10 flex-1 border-0 bg-transparent text-sm text-black outline-none placeholder:text-[#8e8e8e] disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        void handleCommentSubmit();
                      }}
                      disabled={isSubmittingComment || commentInput.trim() === ""}
                      className="text-sm font-semibold text-[#0095f6] hover:text-[#1877f2] disabled:opacity-60"
                    >
                      {isSubmittingComment ? "Sending..." : "Send"}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-[#8e8e8e]">
                    {effectiveCommentsCount} comments
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col bg-white md:hidden">
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
            <Link to={authorProfilePath} className="mt-0.5 shrink-0">
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
</Link>
                    <div className="flex min-w-0 items-center gap-2">
                <Link
  to={authorProfilePath}
  className="text-sm font-semibold text-black"
>
  {post.author.username}
</Link>

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
                    src={resolveMediaUrl(post.imageUrl)}
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
                      onClick={handleCommentIconClick}
                      className="text-left text-sm font-medium hover:opacity-70"
                    >
                      <MessageCircle
                        className="h-6 w-6 scale-x-[-1]"
                        strokeWidth={1.75}
                      />
                    </button>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-black">
                    {effectiveLikesCount} likes
                  </p>

                  <p className="mt-1 text-sm text-[#8e8e8e]">
                    {effectiveCommentsCount} comments
                  </p>

                  <p className="mt-2 text-xs uppercase tracking-wide text-[#8e8e8e]">
                    {formatRelativeTime(post.createdAt)}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-black">
                    <Link
  to={authorProfilePath}
  className="mr-2 font-semibold"
>
  {post.author.username}
</Link>
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