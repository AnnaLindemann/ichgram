import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type FollowsState = {
  relations: Record<string, boolean>;
};

const initialState: FollowsState = {
  relations: {},
};

type SetFollowRelationPayload = {
  userId: string;
  isFollowing: boolean;
};

type SeedEntry = {
  userId: string;
  isFollowing: boolean;
};

const followsSlice = createSlice({
  name: "follows",
  initialState,
  reducers: {
    setFollowRelation(state, action: PayloadAction<SetFollowRelationPayload>) {
      state.relations[action.payload.userId] = action.payload.isFollowing;
    },
    seedFollowRelations(state, action: PayloadAction<SeedEntry[]>) {
      for (const entry of action.payload) {
        state.relations[entry.userId] = entry.isFollowing;
      }
    },
  },
});

export const { setFollowRelation, seedFollowRelations } = followsSlice.actions;

export default followsSlice.reducer;
