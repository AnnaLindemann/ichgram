import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfilePostsGrid } from "@/features/profile/components/ProfilePostsGrid";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearViewedProfile,
  fetchUserProfile,
} from "@/store/slices/profileSlice";

export default function OtherProfilePage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { viewedProfile, loading, error } = useAppSelector(
    (state) => state.profile,
  );

  useEffect(() => {
    if (!id) {
      return;
    }

    void dispatch(fetchUserProfile(id));

    return () => {
      dispatch(clearViewedProfile());
    };
  }, [dispatch, id]);

  if (!id) {
    return <div className="p-4">Profile not found.</div>;
  }

  if (loading) {
    return <div className="p-4">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!viewedProfile) {
    return <div className="p-4">Profile not found.</div>;
  }

  const { user, stats, posts } = viewedProfile;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
      <ProfileHeader user={user} stats={stats} />

      <div className="mt-8 border-t pt-6">
        <ProfilePostsGrid
          posts={posts}
          onPostClick={(postId) => navigate(`/posts/${postId}`)}
        />
      </div>
    </section>
  );
}