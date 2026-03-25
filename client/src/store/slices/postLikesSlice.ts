import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type PostLikesState = {
  likedByPostId: Record<string, boolean>;
  likesCountByPostId: Record<string, number>;
};

type PostLikeSeedEntry = {
  postId: string;
  likedByMe: boolean;
  likesCount: number;
};

type SetPostLikeStatePayload = {
  postId: string;
  likedByMe: boolean;
  likesCount: number;
};

const initialState: PostLikesState = {
  likedByPostId: {},
  likesCountByPostId: {},
};

const postLikesSlice = createSlice({
  name: "postLikes",
  initialState,
  reducers: {
    seedPostLikes(state, action: PayloadAction<PostLikeSeedEntry[]>) {
      for (const entry of action.payload) {
        const hasLikedState = entry.postId in state.likedByPostId;
        const hasLikesCountState = entry.postId in state.likesCountByPostId;

        if (!hasLikedState) {
          state.likedByPostId[entry.postId] = entry.likedByMe;
        }

        if (!hasLikesCountState) {
          state.likesCountByPostId[entry.postId] = entry.likesCount;
        }
      }
    },
    setPostLikeState(state, action: PayloadAction<SetPostLikeStatePayload>) {
      const { postId, likedByMe, likesCount } = action.payload;

      state.likedByPostId[postId] = likedByMe;
      state.likesCountByPostId[postId] = likesCount;
    },
  },
});

export const { seedPostLikes, setPostLikeState } = postLikesSlice.actions;

export default postLikesSlice.reducer;