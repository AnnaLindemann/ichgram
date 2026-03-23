import { Types } from "mongoose";
import { CommentModel } from "./comments.model.js";

export async function getCommentsCountForPosts(
  postIds: string[],
): Promise<Record<string, number>> {
  if (postIds.length === 0) {
    return {};
  }

  const objectIds = postIds.map((id) => new Types.ObjectId(id));

  const rows = await CommentModel.aggregate<{
    _id: Types.ObjectId;
    count: number;
  }>([
    {
      $match: {
        postId: { $in: objectIds },
      },
    },
    {
      $group: {
        _id: "$postId",
        count: { $sum: 1 },
      },
    },
  ]);

  const result: Record<string, number> = {};

  for (const row of rows) {
    result[row._id.toString()] = row.count;
  }

  return result;
}