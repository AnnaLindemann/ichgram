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
        const alreadySeeded =
          entry.postId in state.likedByPostId ||
          entry.postId in state.likesCountByPostId;

        if (!alreadySeeded) {
          state.likedByPostId[entry.postId] = entry.likedByMe;
          state.likesCountByPostId[entry.postId] = entry.likesCount;
        }
      }
    },

    syncPostLikesFromServer(state, action: PayloadAction<PostLikeSeedEntry[]>) {
      for (const entry of action.payload) {
        state.likedByPostId[entry.postId] = entry.likedByMe;
        state.likesCountByPostId[entry.postId] = entry.likesCount;
      }
    },

    setPostLikeState(state, action: PayloadAction<SetPostLikeStatePayload>) {
      const { postId, likedByMe, likesCount } = action.payload;

      state.likedByPostId[postId] = likedByMe;
      state.likesCountByPostId[postId] = likesCount;
    },
  },
});

export const { seedPostLikes, syncPostLikesFromServer, setPostLikeState } =
  postLikesSlice.actions;

export default postLikesSlice.reducer;