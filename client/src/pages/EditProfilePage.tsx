import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateMeProfile,
  uploadMyAvatar,
  type UpdateMeProfileInput,
} from "@/features/profile/api/profile.api";
import { updateStoredUsername } from "@/lib/auth-storage";
import { resolveMediaUrl } from "@/shared/lib/resolveMediaUrl";
import type { EditProfileFormValues } from "@/features/profile/types/profile.types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyProfile } from "@/store/slices/profileSlice";
import { updateFeedAuthorUsername } from "@/store/slices/feedSlice";



export default function EditProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { currentProfile, loading, error } = useAppSelector(
    (state) => state.profile,
  );

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<EditProfileFormValues>({
    defaultValues: {
      username: "",
      bio: "",
      website: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (!currentProfile) {
      void dispatch(fetchMyProfile());
    }
  }, [currentProfile, dispatch]);

  useEffect(() => {
    if (!currentProfile) {
      return;
    }

    form.reset({
      username: currentProfile.user.username,
      bio: currentProfile.user.bio,
      website: currentProfile.user.website,
      avatarUrl: currentProfile.user.avatarUrl,
    });
  }, [currentProfile, form]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  function handleNewPhotoClick() {
    fileInputRef.current?.click();
  }

  async function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSubmitError(null);
    setIsUploadingAvatar(true);

    const previewUrl = URL.createObjectURL(file);

    setLocalPreviewUrl((previousPreviewUrl) => {
      if (previousPreviewUrl) {
        URL.revokeObjectURL(previousPreviewUrl);
      }

      return previewUrl;
    });

    try {
      const response = await uploadMyAvatar(file);

      if (!response.ok) {
        setSubmitError(response.message);
        return;
      }



form.setValue("avatarUrl", response.data.avatarUrl, {
  shouldDirty: true,
  shouldTouch: true,
  shouldValidate: true,
});
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload avatar";

      setSubmitError(message);
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  }

  async function onSubmit(values: EditProfileFormValues) {
    try {
      setSubmitError(null);
      setIsSaving(true);

      const trimmedUsername = values.username.trim();

      if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
        setSubmitError("Username must be between 3 and 30 characters");
        return;
      }

      if (!/^[a-zA-Z0-9_.]+$/.test(trimmedUsername)) {
        setSubmitError(
          "Username can only contain letters, numbers, dots, and underscores",
        );
        return;
      }

      const payload: UpdateMeProfileInput = {
        bio: values.bio.trim(),
        website: values.website.trim(),
        avatarUrl: values.avatarUrl.trim(),
      };
      if (trimmedUsername !== currentProfile?.user.username) {
        payload.username = trimmedUsername;
      }

      const response = await updateMeProfile(payload);

      if (!response.ok) {
        setSubmitError(response.error);
        return;
      }

      updateStoredUsername(response.data.username);

      // Patch author.username in feed posts so the feed reflects the new
      // username without requiring a page reload.
      if (payload.username !== undefined && currentProfile?.user.id) {
        dispatch(
          updateFeedAuthorUsername({
            authorId: currentProfile.user.id,
            username: response.data.username,
          }),
        );
      }

      await dispatch(fetchMyProfile()).unwrap();
      navigate("/profile");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";

      setSubmitError(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (loading && !currentProfile) {
    return <div className="p-4">Loading profile...</div>;
  }

  if (error && !currentProfile) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!currentProfile && !loading) {
    return <Navigate to="/profile" replace />;
  }

  const user = currentProfile?.user;
  const aboutValue = form.watch("bio") ?? "";
  const avatarUrlValue = form.watch("avatarUrl") ?? "";

 const avatarSrc = localPreviewUrl
  ? localPreviewUrl
  : resolveMediaUrl(avatarUrlValue || user?.avatarUrl);

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <h1 className="mb-8 text-xl font-semibold">Edit profile</h1>

      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between rounded-2xl bg-[rgba(239,239,239,1)] px-4 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <img
              src={avatarSrc}
              alt={user?.username || "Profile avatar"}
              className="h-14 w-14 rounded-full object-cover"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {user?.username}
              </p>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {aboutValue}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleNewPhotoClick}
            disabled={isUploadingAvatar}
            className="ml-4 h-9 rounded-[8px] bg-[#0095F6] px-5 text-sm font-semibold text-white hover:bg-[#0095F6]/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isUploadingAvatar ? "Uploading..." : "New photo"}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            className="rounded-xl"
            placeholder=""
            {...form.register("username")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            className="rounded-xl"
            placeholder=""
            {...form.register("website")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">About</Label>

          <div className="relative">
            <Textarea
              id="bio"
              maxLength={150}
              placeholder=""
              className="min-h-28 resize-none rounded-xl pr-16"
              {...form.register("bio")}
            />
            <span className="pointer-events-none absolute right-3 bottom-3 text-xs text-muted-foreground">
              {aboutValue.length} / 150
            </span>
          </div>
        </div>

        {submitError ? (
          <p className="text-sm text-red-500">{submitError}</p>
        ) : null}

        <div className="flex justify-start pt-2">
          <Button
            type="submit"
            disabled={isSaving || isUploadingAvatar}
            className="h-10 min-w-56 rounded-[8px] bg-[#0095F6] px-8 text-sm font-semibold text-white hover:bg-[#0095F6]/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </section>
  );
}