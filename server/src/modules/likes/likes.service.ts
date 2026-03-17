import mongoose from "mongoose";
import { LikeModel } from "./likes.model.js";

export interface PostLikesMeta {
  likesCount: number;
  likedByMe: boolean;
}

export async function getLikesMetaForPosts(
  postIds: string[],
  viewerId?: string
): Promise<Record<string, PostLikesMeta>> {
  if (postIds.length === 0) {
    return {};
  }

  const validPostObjectIds = postIds.map((id) => new mongoose.Types.ObjectId(id));

  const likes = await LikeModel.find({
    postId: { $in: validPostObjectIds },
  })
    .select("postId userId")
    .lean();

  const likedPostIdsByViewer = new Set<string>();

  if (viewerId && mongoose.Types.ObjectId.isValid(viewerId)) {
    for (const like of likes) {
      if (String(like.userId) === viewerId) {
        likedPostIdsByViewer.add(String(like.postId));
      }
    }
  }

  const countsMap = new Map<string, number>();

  for (const like of likes) {
    const postId = String(like.postId);
    const currentCount = countsMap.get(postId) ?? 0;
    countsMap.set(postId, currentCount + 1);
  }

  const result: Record<string, PostLikesMeta> = {};

  for (const postId of postIds) {
    result[postId] = {
      likesCount: countsMap.get(postId) ?? 0,
      likedByMe: likedPostIdsByViewer.has(postId),
    };
  }

  return result;
}