import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const avatarStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = crypto.randomBytes(8).toString("hex");
    cb(null, `avatar-${Date.now()}-${unique}${ext}`);
  },
});

const postStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = crypto.randomBytes(8).toString("hex");
    cb(null, `post-${Date.now()}-${unique}${ext}`);
  },
});

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
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("avatar");

export const uploadSinglePostImage = multer({
  storage: postStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("image");
