import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getPostById,
  type ProfilePostDetailsData,
} from "@/features/profile/api/profile.api";
import { updatePost } from "@/features/posts/api/posts.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyProfile } from "@/store/slices/profileSlice";

const CAPTION_MAX_LENGTH = 200;

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentProfile = useAppSelector((state) => state.profile.currentProfile);

  const [post, setPost] = useState<ProfilePostDetailsData | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentProfile) {
      void dispatch(fetchMyProfile());
    }
  }, [currentProfile, dispatch]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setLoadError("Post not found.");
      return;
    }

    const controller = new AbortController();

    const loadPost = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const data = await getPostById(id);

        if (!controller.signal.aborted) {
          setPost(data);
          setCaption(data.caption);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load post.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadPost();

    return () => {
      controller.abort();
    };
  }, [id]);

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return post?.imageUrl ?? "";
    }

    return URL.createObjectURL(selectedFile);
  }, [selectedFile, post?.imageUrl]);

  useEffect(() => {
    return () => {
      if (selectedFile && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [selectedFile, previewUrl]);

  function handleBack() {
    if (isSaving) {
      return;
    }

    navigate(-1);
  }

  function handleSelectImageClick() {
    if (isSaving) {
      return;
    }

    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSubmitError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    setSubmitError("");
    setSelectedFile(file);
    event.target.value = "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!post || isSaving || !hasChanges) {
      return;
    }

    setSubmitError("");
    setIsSaving(true);

    const result = await updatePost(post.id, {
      caption,
      imageFile: selectedFile,
    });

    if (!result.ok) {
      setSubmitError(result.error);
      setIsSaving(false);
      return;
    }

    await dispatch(fetchMyProfile());

    navigate(-1);
  }

  if (!id) {
    return <Navigate to="/profile" replace />;
  }

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
        <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground shadow-sm">
          Loading post...
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
        <div className="rounded-2xl border bg-white p-6 text-sm text-red-500 shadow-sm">
          {loadError}
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
        <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground shadow-sm">
          Post not found.
        </div>
      </section>
    );
  }

  const isOwner = currentProfile?.user.id === post.author.id;

  if (!isOwner) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
        <div className="rounded-2xl border bg-white p-6 text-sm text-red-500 shadow-sm">
          You can edit only your own posts.
        </div>
      </section>
    );
  }

  const hasCaptionChanged = caption.trim() !== post.caption.trim();
  const hasImageChanged = selectedFile !== null;
  const hasChanges = hasCaptionChanged || hasImageChanged;

  const isSaveDisabled =
    isSaving || caption.length > CAPTION_MAX_LENGTH || !hasChanges;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-black">Edit post</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your caption or replace the image.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          disabled={isSaving}
          className="rounded-[8px]"
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr]">
            <div className="border-b bg-[#fafafa] md:border-b-0 md:border-r">
              <div className="aspect-square w-full">
                <img
                  src={previewUrl}
                  alt="Post preview"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex min-h-[320px] flex-col">
              <div className="flex items-center justify-between gap-3 border-b px-4 py-4">
                <p className="text-sm font-semibold text-black">
                  {post.author.username}
                </p>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSelectImageClick}
                  disabled={isSaving}
                  className="h-8 rounded-[8px] px-3 text-sm font-medium text-[#0095F6] hover:bg-transparent hover:text-[#0095F6]"
                >
                  Replace image
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex min-h-0 flex-1 flex-col px-4 py-4">
                <Textarea
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  maxLength={CAPTION_MAX_LENGTH}
                  disabled={isSaving}
                  placeholder="Write a caption..."
                  className="min-h-[180px] resize-none border-0 px-0 py-0 text-sm text-black shadow-none focus-visible:ring-0 disabled:opacity-100"
                />

                <div className="mt-3 flex justify-end">
                  <span className="text-xs text-[#8e8e8e]">
                    {caption.length}/{CAPTION_MAX_LENGTH}
                  </span>
                </div>

                {submitError ? (
                  <p className="mt-4 text-sm text-red-500">{submitError}</p>
                ) : null}

                <div className="mt-auto pt-6">
                  <Button
                    type="submit"
                    disabled={isSaveDisabled}
                    className="h-10 w-full rounded-[8px] bg-[#0095F6] text-sm font-semibold text-white hover:bg-[#0095F6]/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}