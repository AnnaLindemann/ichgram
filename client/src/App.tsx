import { Route, Routes } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import NotFoundPage from "./pages/NotFoundPage";
import FeedPage from "./pages/FeedPage";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import MessagesPage from "./pages/MessagesPage";
import ExplorePage from "./pages/ExplorePage";
import CreatePostPage from "./pages/CreatePostPage";
import RegisterPage from "./pages/RegisterPage";
import TroubleLoggingInPage from "./pages/TroubleLoggingInPage";

export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/trouble-logging-in"
        element={<TroubleLoggingInPage />}
      />

      <Route element={<AppLayout />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/create" element={<CreatePostPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}