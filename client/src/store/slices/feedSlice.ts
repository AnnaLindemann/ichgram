import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { FeedPost } from "@/features/feed/types/feed-post.types";

type FeedStatus = "idle" | "loading" | "error" | "empty" | "ready";

type FeedState = {
  posts: FeedPost[];
  page: number;
  totalPages: number;
  status: FeedStatus;
  error: string | null;
  loadingMore: boolean;
};

const initialState: FeedState = {
  posts: [],
  page: 1,
  totalPages: 1,
  status: "idle",
  error: null,
  loadingMore: false,
};

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    setFeedLoading(state) {
      state.status = "loading";
      state.error = null;
    },
    setFeedError(state, action: PayloadAction<string>) {
      state.status = "error";
      state.error = action.payload;
    },
    setFeedEmpty(state) {
      state.status = "empty";
    },
    initFeed(
      state,
      action: PayloadAction<{
        posts: FeedPost[];
        page: number;
        totalPages: number;
      }>,
    ) {
      state.posts = action.payload.posts;
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.status = "ready";
      state.error = null;
      state.loadingMore = false;
    },
    setFeedLoadingMore(state, action: PayloadAction<boolean>) {
      state.loadingMore = action.payload;
    },
    appendFeedPosts(
      state,
      action: PayloadAction<{
        posts: FeedPost[];
        page: number;
        totalPages: number;
      }>,
    ) {
      state.posts = [...state.posts, ...action.payload.posts];
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.loadingMore = false;
    },
    prependFeedPost(state, action: PayloadAction<FeedPost>) {
      state.posts = [action.payload, ...state.posts];
    },
    // Patches author.username in all cached feed posts when the current user
    // renames themselves. Without this, feed posts show the stale username
    // until the page is hard-refreshed.
    updateFeedAuthorUsername(
      state,
      action: PayloadAction<{ authorId: string; username: string }>,
    ) {
      const { authorId, username } = action.payload;
      for (const post of state.posts) {
        if (post.author.id === authorId) {
          post.author.username = username;
        }
      }
    },
  },
});

export const {
  setFeedLoading,
  setFeedError,
  setFeedEmpty,
  initFeed,
  setFeedLoadingMore,
  appendFeedPosts,
  prependFeedPost,
  updateFeedAuthorUsername,
} = feedSlice.actions;

export default feedSlice.reducer;
