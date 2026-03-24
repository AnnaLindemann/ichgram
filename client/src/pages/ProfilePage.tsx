import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfilePostsGrid } from "@/features/profile/components/ProfilePostsGrid";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyProfile } from "@/store/slices/profileSlice";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { currentProfile, loading, error } = useAppSelector(
    (state) => state.profile,
  );

  useEffect(() => {
    void dispatch(fetchMyProfile());
  }, [dispatch]);

  if (loading) {
    return <div className="p-4">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!currentProfile) {
    return <div className="p-4">Profile not found.</div>;
  }

  const { user, stats, posts } = currentProfile;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
      <ProfileHeader
        user={user}
        stats={stats}
        actions={
          <Button
            asChild
            size="sm"
            className="h-8 w-fit rounded-[8px] bg-[rgba(239,239,239,1)] px-10 text-sm font-semibold text-black hover:bg-[rgba(239,239,239,1)]"
          >
            <Link to="/profile/edit">Edit profile</Link>
          </Button>
        }
      />

      <div className="mt-8 border-t pt-6">
        <ProfilePostsGrid
          posts={posts}
          onPostClick={(postId) => navigate(`/posts/${postId}`)}
        />
      </div>
    </section>
  );
}