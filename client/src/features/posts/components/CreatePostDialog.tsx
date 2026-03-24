import { useEffect, useMemo, useRef, useState } from "react";
import { Smile, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/features/posts/api/posts.api";
import { useAppDispatch } from "@/store/hooks";
import { fetchMyProfile } from "@/store/slices/profileSlice";
import upload from "../../../assets/icons/upload.svg";

type CreatePostDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CAPTION_MAX_LENGTH = 200;

export function CreatePostDialog({
  open,
  onOpenChange,
}: CreatePostDialogProps) {
  const dispatch = useAppDispatch();

  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const captionLength = caption.length;
  const isShareDisabled = !selectedFile || isSubmitting;

  const fallbackInitials = useMemo(() => "IC", []);

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!open) {
      setCaption("");
      setSelectedFile(null);
      setSubmitError(null);
      setIsSubmitting(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  function handleUploadClick() {
    if (isSubmitting) {
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
      return;
    }

    setSubmitError(null);
    setSelectedFile(file);
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    onOpenChange(false);
  }

  async function handleSubmit() {
    if (!selectedFile || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const result = await createPost(selectedFile, caption);

    if (!result.ok) {
      setSubmitError(result.error);
      setIsSubmitting(false);
      return;
    }

    await dispatch(fetchMyProfile());

    onOpenChange(false);
    setIsSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 max-h-[90vh] max-w-[calc(100vw-16px)] overflow-hidden rounded-2xl border-0 p-0 sm:max-w-[760px] [&>button]:hidden">
        <DialogHeader className="relative border-b px-4 py-3">
          <DialogTitle className="text-center text-base font-semibold">
            Create new post
          </DialogTitle>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isShareDisabled}
            onClick={handleSubmit}
            className="absolute right-12 top-1/2 h-auto -translate-y-1/2 px-2 text-sm font-semibold text-[#0095f6] hover:bg-transparent hover:text-[#0095f6] disabled:opacity-50 md:right-3"
          >
            {isSubmitting ? "Sharing..." : "Share"}
          </Button>

          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#262626] transition-colors hover:bg-black/5 md:hidden"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="grid h-[460px] grid-cols-1 md:grid-cols-[1.6fr_1fr]">
          <div className="flex items-center justify-center bg-[#fafafa] md:border-r">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isSubmitting}
              className="flex h-full w-full items-center justify-center overflow-hidden p-6 text-[#8e8e8e] disabled:cursor-not-allowed"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Post preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img src={upload} alt="Upload icon" className="h-28 w-28" />
              )}
            </button>
          </div>

          <div className="flex min-h-0 flex-col bg-white">
            <div className="flex items-center gap-3 px-4 py-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-[#f5f5f5] text-[10px] font-semibold text-[#262626]">
                {fallbackInitials}
              </div>

              <span className="text-sm font-semibold text-[#262626]">
                skai_laba
              </span>
            </div>

            <div className="grid min-h-0 flex-1 grid-rows-[0.5fr_56px_1fr]">
              <div className="flex min-h-0 flex-col px-4 pt-1">
                <Textarea
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  maxLength={CAPTION_MAX_LENGTH}
                  disabled={isSubmitting}
                  className="min-h-0 flex-1 resize-none border-0 px-0 py-0 text-sm text-[#262626] shadow-none focus-visible:ring-0 disabled:opacity-100"
                />

                <div className="flex justify-end pb-3 pt-2">
                  <span className="text-xs text-[#c7c7c7]">
                    {captionLength}/{CAPTION_MAX_LENGTH}
                  </span>
                </div>
              </div>

              <div className="flex items-end px-4 py-3">
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center text-[#737373] transition-colors hover:text-[#262626]"
                  aria-label="Add emoji"
                >
                  <Smile className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-0 border-y bg-white" />
            </div>

            {submitError ? (
              <div className="border-t px-4 py-3 text-sm text-red-500">
                {submitError}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}