import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "./slices/profileSlice";
import followsReducer from "./slices/followsSlice";
import postLikesReducer from "./slices/postLikesSlice";
export const store = configureStore({
  reducer: {
    profile: profileReducer,
    follows: followsReducer,
    postLikes: postLikesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;