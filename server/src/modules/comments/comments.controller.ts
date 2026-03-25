import type { Request, Response } from "express";
import { PostModel } from "../posts/posts.model.js";
import { CommentModel } from "./comments.model.js";
import { toPublicComment, type PublicCommentAuthor } from "./comments.type.js";
import {
  commentPostParamsSchema,
  createCommentBodySchema,
  commentIdParamsSchema,
  updateCommentBodySchema,
} from "./comments.schema.js";
import { HttpError } from "../../shared/http-error.js";
import { createNotification } from "../notifications/notifications.service.js";
import { UserModel } from "../users/users.model.js";
import type { UserDocument } from "../users/users.type.js";

function buildPublicCommentAuthor(
  user: UserDocument | null,
  fallbackId: string,
): PublicCommentAuthor {
  if (!user) {
    return { id: fallbackId, username: "[deleted]", avatarUrl: null };
  }

  return {
    id: String(user._id),
    username: user.username,
    avatarUrl: user.avatarUrl.length > 0 ? user.avatarUrl : null,
  };
}

export async function createComment(
  req: Request,
  res: Response
): Promise<void> {
  const { id: postId } = commentPostParamsSchema.parse(req.params);
  const { content } = createCommentBodySchema.parse(req.body);

  if (!req.user?.id) {
    throw new HttpError(401, "unauthorized");
  }

  const authorId = req.user.id;

  const post = await PostModel.findById(postId).exec();

  if (!post) {
    throw new HttpError(404, "post not found");
  }

  const createdComment = await CommentModel.create({
    postId,
    authorId,
    content,
  });

  await createNotification({
    recipientId: post.author.toString(),
    actorId: authorId,
    type: "comment",
    entityType: "comment",
    entityId: createdComment._id.toString(),
    postId: post._id.toString(),
  });

  const authorDoc = await UserModel.findById(authorId).exec();
  const publicComment = toPublicComment(
    createdComment,
    buildPublicCommentAuthor(authorDoc, authorId),
  );

  res.status(201).json({
    ok: true,
    data: publicComment,
  });
}

export async function getCommentsByPostId(
  req: Request,
  res: Response
): Promise<void> {
  const { id: postId } = commentPostParamsSchema.parse(req.params);

  const post = await PostModel.findById(postId).exec();

  if (!post) {
    throw new HttpError(404, "post not found");
  }

  const comments = await CommentModel.find({ postId })
    .sort({ createdAt: 1 })
    .exec();

  const uniqueAuthorIds = [...new Set(comments.map((c) => String(c.authorId)))];

  const authors = await UserModel.find({ _id: { $in: uniqueAuthorIds } }).exec();

  const authorMap = new Map<string, UserDocument>(
    authors.map((u) => [String(u._id), u]),
  );

  const data = comments.map((comment) => {
    const authorDoc = authorMap.get(String(comment.authorId)) ?? null;
    return toPublicComment(
      comment,
      buildPublicCommentAuthor(authorDoc, String(comment.authorId)),
    );
  });

  res.status(200).json({ ok: true, data });
}

export async function updateComment(
  req: Request,
  res: Response
): Promise<void> {
  const { id: commentId } = commentIdParamsSchema.parse(req.params);
  const { content } = updateCommentBodySchema.parse(req.body);

  if (!req.user?.id) {
    throw new HttpError(401, "unauthorized");
  }

  const currentUserId = req.user.id;

  const comment = await CommentModel.findById(commentId).exec();

  if (!comment) {
    throw new HttpError(404, "comment not found");
  }

  if (String(comment.authorId) !== currentUserId) {
    throw new HttpError(403, "forbidden");
  }

  comment.content = content;
  await comment.save();

  const authorDoc = await UserModel.findById(String(comment.authorId)).exec();
  const publicComment = toPublicComment(
    comment,
    buildPublicCommentAuthor(authorDoc, String(comment.authorId)),
  );

  res.status(200).json({
    ok: true,
    data: publicComment,
  });
}

export async function deleteComment(
  req: Request,
  res: Response
): Promise<void> {
  const { id: commentId } = commentIdParamsSchema.parse(req.params);

  if (!req.user?.id) {
    throw new HttpError(401, "unauthorized");
  }

  const currentUserId = req.user.id;

  const comment = await CommentModel.findById(commentId).exec();

  if (!comment) {
    throw new HttpError(404, "comment not found");
  }

  if (String(comment.authorId) !== currentUserId) {
    throw new HttpError(403, "forbidden");
  }

  await comment.deleteOne();

  res.status(200).json({
    ok: true,
    data: { message: "comment deleted" },
  });
}
