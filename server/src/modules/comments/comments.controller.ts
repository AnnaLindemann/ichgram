import type { Request, Response } from "express";
import { PostModel } from "../posts/posts.model.js";
import { CommentModel } from "./comments.model.js";
import { toPublicComment } from "./comments.type.js";
import { commentPostParamsSchema,
  createCommentBodySchema,
  commentIdParamsSchema,updateCommentBodySchema } from "./comments.schema.js";
export async function createComment(
  req: Request,
  res: Response
): Promise<void> {
  const paramsResult = commentPostParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    res.status(400).json({ ok: false, error: "invalid post id" });
    return;
  }

  const bodyResult = createCommentBodySchema.safeParse(req.body);

  if (!bodyResult.success) {
    const firstIssue = bodyResult.error.issues[0];
    res.status(400).json({
      ok: false,
      error: firstIssue?.message ?? "invalid request body",
    });
    return;
  }

  if (!req.user?.id) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const { id: postId } = paramsResult.data;
  const { content } = bodyResult.data;
  const authorId = req.user.id;

  const post = await PostModel.findById(postId).exec();

  if (!post) {
    res.status(404).json({ ok: false, error: "post not found" });
    return;
  }

  const createdComment = await CommentModel.create({
    postId,
    authorId,
    content,
  });

  const publicComment = toPublicComment(createdComment);

  res.status(201).json({
    ok: true,
    data: publicComment,
  });
}

export async function getCommentsByPostId(
  req: Request,
  res: Response
): Promise<void> {
  const paramsResult = commentPostParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    res.status(400).json({ ok: false, error: "invalid post id" });
    return;
  }

  const { id: postId } = paramsResult.data;

  const post = await PostModel.findById(postId).exec();

  if (!post) {
    res.status(404).json({ ok: false, error: "post not found" });
    return;
  }

  const comments = await CommentModel.find({ postId })
    .sort({ createdAt: 1 })
    .exec();

  const data = comments.map(toPublicComment);

  res.status(200).json({ ok: true, data });
}

export async function updateComment(
  req: Request,
  res: Response
): Promise<void> {
  const paramsResult = commentIdParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    res.status(400).json({ ok: false, error: "invalid comment id" });
    return;
  }

  const bodyResult = updateCommentBodySchema.safeParse(req.body);

  if (!bodyResult.success) {
    const firstIssue = bodyResult.error.issues[0];
    res.status(400).json({
      ok: false,
      error: firstIssue?.message ?? "invalid request body",
    });
    return;
  }

  if (!req.user?.id) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const { id: commentId } = paramsResult.data;
  const { content } = bodyResult.data;
  const currentUserId = req.user.id;

  const comment = await CommentModel.findById(commentId).exec();

  if (!comment) {
    res.status(404).json({ ok: false, error: "comment not found" });
    return;
  }

  if (String(comment.authorId) !== currentUserId) {
    res.status(403).json({ ok: false, error: "forbidden" });
    return;
  }

  comment.content = content;
  await comment.save();

  const publicComment = toPublicComment(comment);

  res.status(200).json({
    ok: true,
    data: publicComment,
  });
}

export async function deleteComment(
  req: Request,
  res: Response
): Promise<void> {
  const paramsResult = commentIdParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    res.status(400).json({ ok: false, error: "invalid comment id" });
    return;
  }

  if (!req.user?.id) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const { id: commentId } = paramsResult.data;
  const currentUserId = req.user.id;

  const comment = await CommentModel.findById(commentId).exec();

  if (!comment) {
    res.status(404).json({ ok: false, error: "comment not found" });
    return;
  }

  if (String(comment.authorId) !== currentUserId) {
    res.status(403).json({ ok: false, error: "forbidden" });
    return;
  }

  await comment.deleteOne();

  res.status(200).json({
    ok: true,
    data: { message: "comment deleted" },
  });
}