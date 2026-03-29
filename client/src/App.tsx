import { Route, Routes } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import NotFoundPage from "./pages/NotFoundPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import MessagesPage from "./pages/MessagesPage";
import ExplorePage from "./pages/ExplorePage";
import RegisterPage from "./pages/RegisterPage";
import TroubleLoggingInPage from "./pages/TroubleLoggingInPage";
import LoginPage from "./pages/LoginPage";
import PostDetailsPage from "./pages/PostDetailsPage";
import EditProfilePage from "./pages/EditProfilePage";
import OtherProfilePage from "./pages/OtherProfilePage";
import EditPostPage from "./pages/EditPostPage";
import { PublicOnlyRoute } from "./router/PublicOnlyRoute";
import { ProtectedRoute } from "./router/ProtectedRoute";

export default function App() {
  return (
    <Routes>
    <Route element={<PublicOnlyRoute />}>
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/trouble-logging-in"
        element={<TroubleLoggingInPage />}
      />  
      <Route path="/login" element={<LoginPage />} />
      </Route>
<Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/profile/:id" element={<OtherProfilePage />} />       
        <Route path="/posts/:id" element={<PostDetailsPage />} />
        <Route path="/posts/:id/edit" element={<EditPostPage />} />
      </Route>
</Route>
      <Route path="*" element={<NotFoundPage />} />
  </Routes>
  );
}