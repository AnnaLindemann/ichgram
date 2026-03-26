import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfilePostsGrid } from "@/features/profile/components/ProfilePostsGrid";
import {
  followUserById,
  unfollowUserById,
} from "@/features/profile/api/profile.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  applyFollowState,
  clearViewedProfile,
  fetchUserProfile,
  fetchMyProfile,
} from "@/store/slices/profileSlice";
import { seedFollowRelations, setFollowRelation } from "@/store/slices/followsSlice";
import { createDirectConversation } from "@/features/chat/api/chat";

export default function OtherProfilePage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { viewedProfile, currentProfile, loading, error } = useAppSelector(
    (state) => state.profile,
  );
  const followRelations = useAppSelector((state) => state.follows.relations);

  const [isSubmittingFollow, setIsSubmittingFollow] = useState(false);
  const [followError, setFollowError] = useState("");

  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
const [messageError, setMessageError] = useState("");

async function handleOpenMessages() {
  if (!id || isSubmittingMessage) {
    return;
  }

  setMessageError("");
  setIsSubmittingMessage(true);

  const result = await createDirectConversation({
    participantId: id,
  });

  if (!result.ok) {
    setMessageError(result.error);
    setIsSubmittingMessage(false);
    return;
  }

  navigate("/messages", {
    state: {
      conversationId: result.data.id,
    },
  });

  setIsSubmittingMessage(false);
}

  useEffect(() => {
    if (!id) {
      return;
    }

    void dispatch(fetchUserProfile(id));

    return () => {
      dispatch(clearViewedProfile());
    };
  }, [dispatch, id]);

    useEffect(() => {
    if (!currentProfile) {
      void dispatch(fetchMyProfile());
    }
  }, [currentProfile, dispatch]);

  useEffect(() => {
    if (!viewedProfile) {
      return;
    }

    dispatch(
      seedFollowRelations([
        {
          userId: viewedProfile.user.id,
          isFollowing: viewedProfile.user.isFollowing ?? false,
        },
      ]),
    );
  }, [viewedProfile, dispatch]);

  async function handleFollowToggle() {
    if (!id || !viewedProfile || isSubmittingFollow) {
      return;
    }

    setFollowError("");
    setIsSubmittingFollow(true);

    const isFollowing =
      followRelations[viewedProfile.user.id] ??
      viewedProfile.user.isFollowing ??
      false;

    const result = isFollowing
      ? await unfollowUserById(id)
      : await followUserById(id);

    if (!result.ok) {
      setFollowError(result.error);
      setIsSubmittingFollow(false);
      return;
    }

    dispatch(setFollowRelation({ userId: id, isFollowing: !isFollowing }));

    dispatch(
      applyFollowState({
        targetUserId: id,
        isFollowing: !isFollowing,
      }),
    );

    setIsSubmittingFollow(false);
  }

  if (!id) {
    return <div className="p-4">Profile not found.</div>;
  }

   if (loading && !viewedProfile) {
    return <div className="p-4">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!viewedProfile) {
    return <div className="p-4">Profile not found.</div>;
  }

  const { user, stats, posts } = viewedProfile;
  const isFollowing =
    followRelations[user.id] ?? user.isFollowing ?? false;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
      <ProfileHeader
        user={user}
        stats={stats}
        actions={
          <>
            <Button
              type="button"
              size="sm"
              onClick={handleFollowToggle}
              disabled={isSubmittingFollow}
              className={
                isFollowing
                  ? "h-8 w-fit rounded-[8px] bg-[rgba(239,239,239,1)] px-10 text-sm font-semibold text-black hover:bg-[rgba(239,239,239,1)] disabled:opacity-70"
                  : "h-8 w-fit rounded-[8px] bg-[#0095F6] px-10 text-sm font-semibold text-white hover:bg-[#0095F6]/90 disabled:opacity-70"
              }
            >
              {isSubmittingFollow
                ? isFollowing
                  ? "Unfollowing..."
                  : "Following..."
                : isFollowing
                  ? "Following"
                  : "Follow"}
            </Button>

           <Button
  type="button"
  size="sm"
  variant="secondary"
  onClick={handleOpenMessages}
  disabled={isSubmittingMessage}
  className="h-8  rounded-[8px] bg-[#EFEFEF] px-14 text-sm font-semibold text-black hover:bg-[#EFEFEF] disabled:opacity-70"
>
  {isSubmittingMessage ? "Opening..." : "Message"}
</Button>
          </>
        }
      />

      {followError ? (
        <p className="mt-4 text-sm text-red-500">{followError}</p>
      ) : null}

{messageError ? (
  <p className="mt-2 text-sm text-red-500">{messageError}</p>
) : null}
      <div className="mt-8 border-t pt-6">
        <ProfilePostsGrid
          posts={posts}
          onPostClick={(postId) => navigate(`/posts/${postId}`)}
        />
      </div>
    </section>
  );
}