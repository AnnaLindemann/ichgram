import type { Response, Request } from "express";
import type { CreatePostInput, PostDto } from "./posts.type.js";
import { UserModel } from "../users/users.model.js";
import { PostModel } from "./posts.model.js";
import mongoose, { Types } from "mongoose";
import {
  createPostSchema,
  updatePostSchema,
  listPostsQuerySchema,
} from "./posts.schemas.js";
import { getLikesMetaForPosts } from "../likes/likes.service.js";

export async function createPost(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const authorId = req.user.id;

  if (!Types.ObjectId.isValid(authorId)) {
    res.status(401).json({ ok: false, error: "authenticated user id is invalid" });
    return;
  }

  const parsed = createPostSchema.safeParse(req.body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    res.status(400).json({
      ok: false,
      error: firstIssue?.message ?? "invalid request body",
    });
    return;
  }

  const { imageUrl, caption } = parsed.data;

  const existed = await UserModel.findById(authorId).exec();

  if (!existed) {
    res.status(404).json({ ok: false, error: "author does not exist" });
    return;
  }

  const input: CreatePostInput = {
    authorId,
    imageUrl,
    caption: caption ?? "",
  };

  const created = await PostModel.create({
    author: new Types.ObjectId(input.authorId),
    imageUrl: input.imageUrl,
    caption: input.caption,
  });

  const dto: PostDto = {
    id: created._id.toString(),
    authorId: created.author.toString(),
    caption: created.caption,
    imageUrl: created.imageUrl,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
    likesCount: 0,
    likedByMe: false,
   };

  res.status(201).json({
    ok: true,
    data: dto,
  });
}

export async function getPostById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string" || id.trim() === "") {
    res.status(400).json({ ok: false, error: "id is required" });
    return;
  }

  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ ok: false, error: "post is invalid" });
    return;
  }

  const post = await PostModel.findById(id).exec();

  if (!post) {
    res.status(404).json({ ok: false, error: "post not found" });
    return;
  }
  const viewerId = req.user?.id;
  const likesMeta = await getLikesMetaForPosts([String(post._id)], viewerId);
  const meta = likesMeta[String(post._id)];
  const data: PostDto = {
   id: post._id.toString(),
      authorId: post.author.toString(),
      imageUrl: post.imageUrl,
      caption: post.caption,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      likesCount: meta?.likesCount ?? 0,
      likedByMe: meta?.likedByMe ?? false,
  };

  res.status(200).json({ ok: true, data });
}

export async function listPosts(req: Request, res: Response): Promise<void> {
  const parsedQuery = listPostsQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    const firstIssue = parsedQuery.error.issues[0];

    res.status(400).json({
      ok: false,
      error: firstIssue?.message ?? "invalid query",
    });
    return;
  }

  const { authorId } = parsedQuery.data;

  const filter: Record<string, unknown> = {};

  if (authorId !== undefined) {
    if (!mongoose.isValidObjectId(authorId)) {
      res.status(400).json({ ok: false, error: "authorId is invalid" });
      return;
    }

    filter.author = authorId;
  }

  const posts = await PostModel.find(filter).sort({ createdAt: -1 }).limit(20).exec();
  const postIds = posts.map((post) => String(post._id));

const viewerId = req.user?.id;

const likesMeta = await getLikesMetaForPosts(postIds, viewerId);

  res.status(200).json({
    ok: true,
    data: posts.map((p) => {
    const postId = p._id.toString();
    const meta = likesMeta[postId];

    return {
      id: postId,
      authorId: p.author.toString(),
      imageUrl: p.imageUrl,
      caption: p.caption,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),

      likesCount: meta?.likesCount ?? 0,
      likedByMe: meta?.likedByMe ?? false,
    };
    }),
  });
}

export async function updatePostCaption(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string" || id.trim() === "") {
    res.status(400).json({ ok: false, error: "id is required" });
    return;
  }

  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ ok: false, error: "id is invalid" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const parsed = updatePostSchema.safeParse(req.body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    res.status(400).json({
      ok: false,
      error: firstIssue?.message ?? "invalid request body",
    });
    return;
  }

  const { caption } = parsed.data;

  const post = await PostModel.findById(id).exec();

  if (!post) {
    res.status(404).json({ ok: false, error: "post not found" });
    return;
  }

  if (post.author.toString() !== req.user.id) {
    res.status(403).json({ ok: false, error: "forbidden" });
    return;
  }

  post.caption = caption;
  await post.save();

  const viewerId = req.user?.id;
const likesMeta = await getLikesMetaForPosts([String(post._id)], viewerId);
const meta = likesMeta[String(post._id)];

  const data: PostDto = {
    id: post._id.toString(),
    authorId: post.author.toString(),
    caption: post.caption,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    likesCount: meta?.likesCount ?? 0,
  likedByMe: meta?.likedByMe ?? false,
  };

  res.status(200).json({ ok: true, data });
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string" || id.trim() === "") {
    res.status(400).json({ ok: false, error: "id is required" });
    return;
  }

  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ ok: false, error: "id is invalid" });
    return;
  }

  const post = await PostModel.findById(id).exec();

  if (!post) {
    res.status(404).json({ ok: false, error: "post not found" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  if (post.author.toString() !== req.user.id) {
    res.status(403).json({ ok: false, error: "forbidden" });
    return;
  }

  await post.deleteOne();

  res.status(200).json({ ok: true, data: { id } });
}