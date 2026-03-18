import type { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import type { CreatePostInput, ListPostsResponse, PostDto } from "./posts.type.js";
import { UserModel } from "../users/users.model.js";
import { PostModel } from "./posts.model.js";
import {
  createPostSchema,
  updatePostSchema,
  listPostsQuerySchema,
} from "./posts.schemas.js";
import { getLikesMetaForPosts } from "../likes/likes.service.js";
import { HttpError } from "../../shared/http-error.js";

export async function createPost(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new HttpError(401, "unauthorized");
  }

  const authorId = req.user.id;

  if (!Types.ObjectId.isValid(authorId)) {
    throw new HttpError(401, "authenticated user id is invalid");
  }

  const parsed = createPostSchema.parse(req.body);
  const { imageUrl, caption } = parsed;

  const existed = await UserModel.findById(authorId).exec();

  if (!existed) {
    throw new HttpError(404, "author does not exist");
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
    throw new HttpError(400, "id is required");
  }

  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(400, "post is invalid");
  }

  const post = await PostModel.findById(id).exec();

  if (!post) {
    throw new HttpError(404, "post not found");
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
  const { authorId, page, limit, sort, order } = listPostsQuerySchema.parse(req.query);

  const filter: Record<string, unknown> = {};

  if (authorId !== undefined) {
    if (!mongoose.isValidObjectId(authorId)) {
      throw new HttpError(400, "authorId is invalid");
    }

    filter.author = new Types.ObjectId(authorId);
  }

  const skip = (page - 1) * limit;
  const sortDirection = order === "asc" ? 1 : -1;

  const [posts, total] = await Promise.all([
    PostModel.find(filter)
      .sort({ [sort]: sortDirection })
      .skip(skip)
      .limit(limit)
      .exec(),
    PostModel.countDocuments(filter).exec(),
  ]);

  const postIds = posts.map((post) => String(post._id));
  const viewerId = req.user?.id;
  const likesMeta = await getLikesMetaForPosts(postIds, viewerId);

  const data: PostDto[] = posts.map((p) => {
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
  });

  const pages = total === 0 ? 0 : Math.ceil(total / limit);

  const response: ListPostsResponse = {
    ok: true,
    data,
    meta: {
      page,
      limit,
      total,
      pages,
      sort,
      order,
    },
  };

  res.status(200).json(response);
}

export async function updatePostCaption(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string" || id.trim() === "") {
    throw new HttpError(400, "id is required");
  }

  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(400, "id is invalid");
  }

  if (!req.user) {
    throw new HttpError(401, "unauthorized");
  }

  const { caption } = updatePostSchema.parse(req.body);

  const post = await PostModel.findById(id).exec();

  if (!post) {
    throw new HttpError(404, "post not found");
  }

  if (post.author.toString() !== req.user.id) {
    throw new HttpError(403, "forbidden");
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
    throw new HttpError(400, "id is required");
  }

  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(400, "id is invalid");
  }

  const post = await PostModel.findById(id).exec();

  if (!post) {
    throw new HttpError(404, "post not found");
  }

  if (!req.user) {
    throw new HttpError(401, "unauthorized");
  }

  if (post.author.toString() !== req.user.id) {
    throw new HttpError(403, "forbidden");
  }

  await post.deleteOne();

  res.status(200).json({ ok: true, data: { id } });
}