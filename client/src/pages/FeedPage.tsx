import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import allUpdates from "../assets/icons/allUpdates.svg";
import { FeedPostCardSkeleton } from "../features/feed/components/FeedPostCardSkeleton";
import { getPosts } from "../features/feed/api/feed.api";
import { mapPostDtoToFeedPost } from "../features/feed/api/map-post";
import { FeedPostCard } from "../features/feed/components/FeedPostCard";
import type { FeedPost } from "../features/feed/types/feed-post.types";
import {
  followUserById,
  unfollowUserById,
} from "@/features/profile/api/profile.api";
import {
  likePostById,
  unlikePostById,
} from "@/features/posts/api/post-likes.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { applyFollowState } from "@/store/slices/profileSlice";
import {
  seedFollowRelations,
  setFollowRelation,
} from "@/store/slices/followsSlice";
import {
  seedPostLikes,
  setPostLikeState,
} from "@/store/slices/postLikesSlice";
import { seedPostComments } from "@/store/slices/postCommentsSlice";
import {
  setFeedLoading,
  setFeedError,
  setFeedEmpty,
  initFeed,
  setFeedLoadingMore,
  appendFeedPosts,
} from "@/store/slices/feedSlice";

const FEED_GRID_CLASS =
  "grid grid-cols-1 gap-y-8 md:justify-center lg:grid-cols-[repeat(2,470px)] lg:justify-start lg:gap-x-9";

export default function FeedPage() {
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

  const feedStatus = useAppSelector((state) => state.feed.status);
  const feedError = useAppSelector((state) => state.feed.error);
  const feedPosts = useAppSelector((state) => state.feed.posts);
  const feedPage = useAppSelector((state) => state.feed.page);
  const feedTotalPages = useAppSelector((state) => state.feed.totalPages);
  const feedLoadingMore = useAppSelector((state) => state.feed.loadingMore);

  const [followError, setFollowError] = useState("");
  const [likeError, setLikeError] = useState("");
  const [submittingAuthorIds, setSubmittingAuthorIds] = useState<
    Record<string, boolean>
  >({});
  const [submittingLikeByPostId, setSubmittingLikeByPostId] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      dispatch(setFeedLoading());

      try {
        const resp = await getPosts(1);

        if (!isMounted) {
          return;
        }

        if (!resp.ok) {
          dispatch(setFeedError(resp.error));
          return;
        }

        if (resp.data.length === 0) {
          dispatch(setFeedEmpty());
          return;
        }

        const mappedPosts: FeedPost[] = resp.data.map((dto) =>
          mapPostDtoToFeedPost(dto),
        );

        dispatch(
          seedFollowRelations(
            mappedPosts.map((p) => ({
              userId: p.author.id,
              isFollowing: p.isFollowingAuthor,
            })),
          ),
        );

        dispatch(
          seedPostLikes(
            mappedPosts.map((p) => ({
              postId: p.id,
              likedByMe: p.likedByMe,
              likesCount: p.likesCount,
            })),
          ),
        );

        dispatch(
          seedPostComments(
            mappedPosts.map((p) => ({
              postId: p.id,
              commentsCount: p.commentsCount,
            })),
          ),
        );

        dispatch(
          initFeed({
            posts: mappedPosts,
            page: resp.page,
            totalPages: resp.totalPages,
          }),
        );
      } catch {
        if (!isMounted) {
          return;
        }

        dispatch(setFeedError("Network error"));
      }
    }

    void loadInitial();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  async function loadMore() {
    if (feedStatus !== "ready" || feedLoadingMore) {
      return;
    }

    const nextPage = feedPage + 1;

    dispatch(setFeedLoadingMore(true));

    try {
      const resp = await getPosts(nextPage);

      if (!resp.ok) {
        dispatch(setFeedLoadingMore(false));
        return;
      }

      const mappedPosts: FeedPost[] = resp.data.map((dto) =>
        mapPostDtoToFeedPost(dto),
      );

      dispatch(
        seedFollowRelations(
          mappedPosts.map((p) => ({
            userId: p.author.id,
            isFollowing: p.isFollowingAuthor,
          })),
        ),
      );

      dispatch(
        seedPostLikes(
          mappedPosts.map((p) => ({
            postId: p.id,
            likedByMe: p.likedByMe,
            likesCount: p.likesCount,
          })),
        ),
      );

      dispatch(
        seedPostComments(
          mappedPosts.map((p) => ({
            postId: p.id,
            commentsCount: p.commentsCount,
          })),
        ),
      );

      dispatch(
        appendFeedPosts({
          posts: mappedPosts,
          page: resp.page,
          totalPages: resp.totalPages,
        }),
      );
    } catch {
      dispatch(setFeedLoadingMore(false));
    }
  }

  async function handleFollowToggle(authorId: string) {
    if (feedStatus !== "ready" || submittingAuthorIds[authorId]) {
      return;
    }

    if (currentProfile?.user.id === authorId) {
      return;
    }

    const targetPost = feedPosts.find((post) => post.author.id === authorId);

    if (!targetPost) {
      return;
    }

    const currentlyFollowing =
      followRelations[authorId] ?? targetPost.isFollowingAuthor;

    setFollowError("");

    dispatch(
      setFollowRelation({
        userId: authorId,
        isFollowing: !currentlyFollowing,
      }),
    );

    setSubmittingAuthorIds((prev) => ({ ...prev, [authorId]: true }));

    if (currentlyFollowing) {
      const result = await unfollowUserById(authorId);

      if (!result.ok) {
        if (result.error === "follow relation not found") {
          dispatch(setFollowRelation({ userId: authorId, isFollowing: false }));
        } else {
          dispatch(setFollowRelation({ userId: authorId, isFollowing: true }));
          setFollowError(result.error);
        }
      } else {
        dispatch(
          applyFollowState({
            targetUserId: authorId,
            isFollowing: false,
          }),
        );
      }
    } else {
      const result = await followUserById(authorId);

      if (!result.ok) {
        if (result.error === "already following this user") {
          dispatch(setFollowRelation({ userId: authorId, isFollowing: true }));
        } else {
          dispatch(setFollowRelation({ userId: authorId, isFollowing: false }));
          setFollowError(result.error);
        }
      } else {
        dispatch(
          applyFollowState({
            targetUserId: authorId,
            isFollowing: true,
          }),
        );
      }
    }

    setSubmittingAuthorIds((prev) => ({ ...prev, [authorId]: false }));
  }

  async function handleLikeToggle(postId: string) {
    if (feedStatus !== "ready" || submittingLikeByPostId[postId]) {
      return;
    }

    const targetPost = feedPosts.find((post) => post.id === postId);

    if (!targetPost) {
      return;
    }

    const currentLikedByMe = likedByPostId[postId] ?? targetPost.likedByMe;
    const currentLikesCount = likesCountByPostId[postId] ?? targetPost.likesCount;

    const optimisticLikedByMe = !currentLikedByMe;
    const optimisticLikesCount = optimisticLikedByMe
      ? currentLikesCount + 1
      : Math.max(0, currentLikesCount - 1);

    setLikeError("");
    setSubmittingLikeByPostId((prev) => ({ ...prev, [postId]: true }));

    dispatch(
      setPostLikeState({
        postId,
        likedByMe: optimisticLikedByMe,
        likesCount: optimisticLikesCount,
      }),
    );

    const result = currentLikedByMe
      ? await unlikePostById(postId)
      : await likePostById(postId);

    if (!result.ok) {
      dispatch(
        setPostLikeState({
          postId,
          likedByMe: currentLikedByMe,
          likesCount: currentLikesCount,
        }),
      );

      setLikeError(result.error);
      setSubmittingLikeByPostId((prev) => ({ ...prev, [postId]: false }));
      return;
    }

    dispatch(
      setPostLikeState({
        postId,
        likedByMe: result.liked,
        likesCount: result.likesCount,
      }),
    );

    setSubmittingLikeByPostId((prev) => ({ ...prev, [postId]: false }));
  }

  if (feedStatus === "loading" || feedStatus === "idle") {
    return (
      <div className="w-full">
        <div className={FEED_GRID_CLASS}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-full lg:w-[470px]">
              <FeedPostCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (feedStatus === "error") {
    return <div className="p-4">Error: {feedError}</div>;
  }

  if (feedStatus === "empty") {
    return <div className="p-4">No posts yet</div>;
  }

  const hasMore = feedPage < feedTotalPages;

  return (
    <div className="w-full">
      {followError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {followError}
        </div>
      ) : null}

      {likeError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {likeError}
        </div>
      ) : null}

      <div className={FEED_GRID_CLASS}>
        {feedPosts.map((post) => {
          const effectivePost: FeedPost = {
            ...post,
            isFollowingAuthor:
              followRelations[post.author.id] ?? post.isFollowingAuthor,
            likedByMe: likedByPostId[post.id] ?? post.likedByMe,
            likesCount: likesCountByPostId[post.id] ?? post.likesCount,
            commentsCount: commentsCountByPostId[post.id] ?? post.commentsCount,
          };

          return (
            <div key={post.id} className="w-full lg:w-[470px]">
              <FeedPostCard
                post={effectivePost}
                canFollowAuthor={currentProfile?.user.id !== post.author.id}
                isSubmittingFollow={Boolean(submittingAuthorIds[post.author.id])}
                isSubmittingLike={Boolean(submittingLikeByPostId[post.id])}
                onPostClick={(postIdValue) => navigate(`/posts/${postIdValue}`)}
                onCommentClick={(postIdValue) => navigate(`/posts/${postIdValue}`)}
                onFollowToggle={handleFollowToggle}
                onLikeToggle={handleLikeToggle}
              />
            </div>
          );
        })}

        <div className="mt-4 flex flex-col items-center text-center lg:col-span-2 lg:w-[979px]">
          {hasMore ? (
            <button
              type="button"
              onClick={() => {
                void loadMore();
              }}
              disabled={feedLoadingMore}
              className="h-10 min-w-40 rounded-lg border border-gray-300 bg-white px-6 text-sm font-semibold text-black hover:bg-gray-50 disabled:opacity-50"
            >
              {feedLoadingMore ? "Loading..." : "Load more"}
            </button>
          ) : (
            <>
              <img
                src={allUpdates}
                alt="All updates"
                className="mb-4 h-12 w-12"
              />

              <h3 className="text-[28px] font-semibold leading-tight text-black">
                You&apos;ve seen all the updates
              </h3>

              <p className="mt-2 text-base text-gray-500">
                You have viewed all new publications
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
