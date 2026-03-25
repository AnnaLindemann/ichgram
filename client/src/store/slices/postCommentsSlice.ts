import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type PostCommentsState = {
  commentsCountByPostId: Record<string, number>;
};

type PostCommentsSeedEntry = {
  postId: string;
  commentsCount: number;
};

type SetPostCommentsCountPayload = {
  postId: string;
  commentsCount: number;
};

const initialState: PostCommentsState = {
  commentsCountByPostId: {},
};

const postCommentsSlice = createSlice({
  name: "postComments",
  initialState,
  reducers: {
    seedPostComments(state, action: PayloadAction<PostCommentsSeedEntry[]>) {
      for (const entry of action.payload) {
        const hasCommentsCountState = entry.postId in state.commentsCountByPostId;

        if (!hasCommentsCountState) {
          state.commentsCountByPostId[entry.postId] = entry.commentsCount;
        }
      }
    },
    setPostCommentsCount(
      state,
      action: PayloadAction<SetPostCommentsCountPayload>,
    ) {
      const { postId, commentsCount } = action.payload;
      state.commentsCountByPostId[postId] = commentsCount;
    },
    incrementPostCommentsCount(state, action: PayloadAction<{ postId: string }>) {
      const { postId } = action.payload;
      const currentCount = state.commentsCountByPostId[postId] ?? 0;
      state.commentsCountByPostId[postId] = currentCount + 1;
    },
    decrementPostCommentsCount(state, action: PayloadAction<{ postId: string }>) {
      const { postId } = action.payload;
      const currentCount = state.commentsCountByPostId[postId] ?? 0;
      state.commentsCountByPostId[postId] = Math.max(0, currentCount - 1);
    },
  },
});

export const {
  seedPostComments,
  setPostCommentsCount,
  incrementPostCommentsCount,
  decrementPostCommentsCount,
} = postCommentsSlice.actions;

export default postCommentsSlice.reducer;