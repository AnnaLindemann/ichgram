import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getFollowersCount,
  getFollowingCount,
  getMeProfile,
  getPostsByUser,
  getUserProfileById,
} from "@/features/profile/api/profile.api";
import type {
  MyProfileData,
  ViewedProfileData,
} from "@/features/profile/types/profile.types";

type ProfileState = {
  currentProfile: MyProfileData | null;
  viewedProfile: ViewedProfileData | null;
  loading: boolean;
  error: string | null;
};

const initialState: ProfileState = {
  currentProfile: null,
  viewedProfile: null,
  loading: false,
  error: null,
};

export const fetchMyProfile = createAsyncThunk<
  MyProfileData,
  void,
  { rejectValue: string }
>("profile/fetchMyProfile", async (_, { rejectWithValue }) => {
  try {
    const profileResponse = await getMeProfile();

    if (!profileResponse.ok) {
      return rejectWithValue(profileResponse.error);
    }

    const user = profileResponse.data;

    const [followersCount, followingCount, postsData] = await Promise.all([
      getFollowersCount(user.id),
      getFollowingCount(user.id),
      getPostsByUser(user.id),
    ]);

    return {
      user,
      stats: {
        postsCount: postsData.total,
        followersCount,
        followingCount,
      },
      posts: postsData.items,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load current profile";

    return rejectWithValue(message);
  }
});

export const fetchUserProfile = createAsyncThunk<
  ViewedProfileData,
  string,
  { rejectValue: string }
>("profile/fetchUserProfile", async (userId, { rejectWithValue }) => {
  try {
    const profileResponse = await getUserProfileById(userId);

    if (!profileResponse.ok) {
      return rejectWithValue(profileResponse.error);
    }

    const user = profileResponse.data;

    const [followersCount, followingCount, postsData] = await Promise.all([
      getFollowersCount(user.id),
      getFollowingCount(user.id),
      getPostsByUser(user.id),
    ]);

    return {
      user,
      stats: {
        postsCount: postsData.total,
        followersCount,
        followingCount,
      },
      posts: postsData.items,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load user profile";

    return rejectWithValue(message);
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearViewedProfile(state) {
      state.viewedProfile = null;
    },
    clearProfileError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProfile = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load current profile";
      })

      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.viewedProfile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load user profile";
      });
  },
});

export const { clearViewedProfile, clearProfileError } = profileSlice.actions;

export default profileSlice.reducer;