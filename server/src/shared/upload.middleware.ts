import multer from "multer";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Store files in memory so the buffer is available for Base64 conversion.
// No disk writes — compatible with ephemeral App Runner filesystem.
const memoryStorage = multer.memoryStorage();

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, png, webp, gif)"));
  }
}

export const uploadSingleImage = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("avatar");

export const uploadSinglePostImage = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("image");
