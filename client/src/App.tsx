import { Route, Routes } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import FeedPage  from "./pages/FeedPage";
import AppLayout from "./layouts/AppLayout";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import MessagePage from "./pages/MessagesPage";
import ExplorePage from "./pages/ExplorePage";
import CreatePostPage from "./pages/CreatePostPage";




export default function App() {
  return (
  <Routes>
    <Route element={<AppLayout/>}>
    <Route path="/" element={<FeedPage/>}/>
    <Route path="/search" element={<SearchPage/>}/>
    <Route path="/explore" element={<ExplorePage/>}/>
    <Route path="/notifications" element={<NotificationsPage/>}/>
    <Route path="/messages" element={<MessagePage/>}/>
    <Route path="/create" element={<CreatePostPage/>}/>
    <Route path="/profile" element={<ProfilePage/>}/>
    <Route path="*" element={<NotFoundPage/>}/>
    </Route>
  </Routes>
)
}