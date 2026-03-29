import type { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import type { CreatePostInput, ListPostsResponse, PostDto } from "./posts.type.js";
import { UserModel } from "../users/users.model.js";
import { PostModel } from "./posts.model.js";
import {
  createPostBodySchema,
  updatePostSchema,
  listPostsQuerySchema,
} from "./posts.schemas.js";
import { getLikesMetaForPosts } from "../likes/likes.service.js";
import { HttpError } from "../../shared/http-error.js";
import { getCommentsCountForPosts } from "../comments/comments.service.js";
import { buildPostDto } from "./posts.mapper.js";
import { isFollowing, getFollowingSet } from "../follows/follows.service.js";

export async function createPost(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new HttpError(401, "unauthorized");
  }

  const authorId = req.user.id;

  if (!Types.ObjectId.isValid(authorId)) {
    throw new HttpError(401, "authenticated user id is invalid");
  }

  if (!req.file) {
    throw new HttpError(400, "image file is required");
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  const { caption } = createPostBodySchema.parse(req.body);

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

const populatedPost = await PostModel.findById(created._id)
  .populate("author", "username fullName avatarUrl")
  .exec();

if (!populatedPost) {
  throw new HttpError(404, "created post not found");
}

const data = buildPostDto({
  post: populatedPost,
  likesCount: 0,
  likedByMe: false,
  commentsCount: 0,
  isFollowingAuthor: false,
});

res.status(201).json({
  ok: true,
  data,
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

  const post = await PostModel.findById(id)
  .populate("author", "username fullName avatarUrl")
  .exec();

if (!post) {
  throw new HttpError(404, "post not found");
}

const viewerId = req.user?.id;

const postId = String(post._id);
const authorId = (post.author as unknown as { _id: { toString(): string } })._id.toString();

const [likesMeta, commentsMeta, isFollowingAuthor] = await Promise.all([
  getLikesMetaForPosts([postId], viewerId),
  getCommentsCountForPosts([postId]),
  viewerId !== undefined && viewerId !== authorId
    ? isFollowing(viewerId, authorId)
    : Promise.resolve(false),
]);

const likeMeta = likesMeta[postId];

const data = buildPostDto({
  post,
  likesCount: likeMeta?.likesCount ?? 0,
  likedByMe: likeMeta?.likedByMe ?? false,
  commentsCount: commentsMeta[postId] ?? 0,
  isFollowingAuthor,
});

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
    .populate("author", "username fullName avatarUrl")
    .sort({ [sort]: sortDirection })
    .skip(skip)
    .limit(limit)
    .exec(),
  PostModel.countDocuments(filter).exec(),
]);

const postIds = posts.map((post) => String(post._id));
const viewerId = req.user?.id;
const authorIds = [
  ...new Set(
    posts.map(
      (post) =>
        (post.author as unknown as { _id: { toString(): string } })._id.toString(),
    ),
  ),
];

const [likesMeta, commentsMeta, followingSet] = await Promise.all([
  getLikesMetaForPosts(postIds, viewerId),
  getCommentsCountForPosts(postIds),
  viewerId !== undefined
    ? getFollowingSet(viewerId, authorIds)
    : Promise.resolve(new Set<string>()),
]);

const data: PostDto[] = posts.map((post) => {
  const postId = post._id.toString();
  const postAuthorId = (
    post.author as unknown as { _id: { toString(): string } }
  )._id.toString();
  const likeMeta = likesMeta[postId];

  return buildPostDto({
    post,
    likesCount: likeMeta?.likesCount ?? 0,
    likedByMe: likeMeta?.likedByMe ?? false,
    commentsCount: commentsMeta[postId] ?? 0,
    isFollowingAuthor:
      viewerId !== undefined && viewerId !== postAuthorId
        ? followingSet.has(postAuthorId)
        : false,
  });
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
  const newImageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  if (caption === undefined && newImageUrl === undefined) {
    throw new HttpError(400, "caption or image is required");
  }

  const post = await PostModel.findById(id).exec();

  if (!post) {
    throw new HttpError(404, "post not found");
  }

  if (post.author.toString() !== req.user.id) {
    throw new HttpError(403, "forbidden");
  }

if (caption !== undefined) {
  post.caption = caption;
}
if (newImageUrl !== undefined) {
  post.imageUrl = newImageUrl;
}
await post.save();

const populatedPost = await PostModel.findById(post._id)
  .populate("author", "username fullName avatarUrl")
  .exec();

if (!populatedPost) {
  throw new HttpError(404, "updated post not found");
}

const viewerId = req.user?.id;
const postId = String(populatedPost._id);

const [likesMeta, commentsMeta] = await Promise.all([
  getLikesMetaForPosts([postId], viewerId),
  getCommentsCountForPosts([postId]),
]);

const likeMeta = likesMeta[postId];

const data = buildPostDto({
  post: populatedPost,
  likesCount: likeMeta?.likesCount ?? 0,
  likedByMe: likeMeta?.likedByMe ?? false,
  commentsCount: commentsMeta[postId] ?? 0,
  isFollowingAuthor: false,
});

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