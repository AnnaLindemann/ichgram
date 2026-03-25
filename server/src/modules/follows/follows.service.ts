import mongoose from "mongoose";
import { HttpError } from "../../shared/http-error.js";
import { UserModel } from "../users/users.model.js";
import { toPublicUser } from "../users/users.type.js";
import { FollowModel } from "./follows.model.js";
import { createNotification } from "../notifications/notifications.service.js";

interface FollowListOptions {
  page: number;
  limit: number;
}

export async function followUser(
  currentUserId: string,
  targetUserId: string,
) {
  if (!mongoose.isValidObjectId(targetUserId)) {
    throw new HttpError(400, "id is invalid");
  }

  if (currentUserId === targetUserId) {
    throw new HttpError(400, "you cannot follow yourself");
  }

  const targetUser = await UserModel.findById(targetUserId).exec();

  if (!targetUser) {
    throw new HttpError(404, "user not found");
  }

  const existingFollow = await FollowModel.findOne({
    followerId: currentUserId,
    followingId: targetUserId,
  }).exec();

  if (existingFollow) {
    throw new HttpError(409, "already following this user");
  }

  try {
    const createdFollow = await FollowModel.create({
      followerId: currentUserId,
      followingId: targetUserId,
    });

    await createNotification({
      recipientId: targetUserId,
      actorId: currentUserId,
      type: "follow",
      entityType: "follow",
      entityId: createdFollow._id.toString(),
    });

    return {
      id: createdFollow._id.toString(),
      followerId: createdFollow.followerId.toString(),
      followingId: createdFollow.followingId.toString(),
      createdAt: createdFollow.createdAt.toISOString(),
      updatedAt: createdFollow.updatedAt.toISOString(),
    };
  } catch (error: unknown) {
    const isMongoDuplicateError =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000;

    if (isMongoDuplicateError) {
      throw new HttpError(409, "already following this user");
    }

    throw error;
  }
}
export async function unfollowUser(
  currentUserId: string,
  targetUserId: string
) {
  if (!mongoose.isValidObjectId(targetUserId)) {
    throw new HttpError(400, "id is invalid");
  }

  if (currentUserId === targetUserId) {
    throw new HttpError(400, "you cannot unfollow yourself");
  }

  const targetUser = await UserModel.findById(targetUserId).exec();

  if (!targetUser) {
    throw new HttpError(404, "user not found");
  }

  const deletedFollow = await FollowModel.findOneAndDelete({
    followerId: currentUserId,
    followingId: targetUserId,
  }).exec();

  if (!deletedFollow) {
    throw new HttpError(404, "follow relation not found");
  }

  return {
    message: "unfollowed successfully",
  };
}

export async function isFollowing(
  currentUserId: string,
  targetUserId: string,
): Promise<boolean> {
  if (currentUserId === targetUserId) {
    return false;
  }

  if (!mongoose.isValidObjectId(currentUserId) || !mongoose.isValidObjectId(targetUserId)) {
    return false;
  }

  const follow = await FollowModel.findOne({
    followerId: currentUserId,
    followingId: targetUserId,
  }).exec();

  return follow !== null;
}

// Returns the set of targetUserIds that viewerId follows — single DB query.
export async function getFollowingSet(
  viewerId: string,
  targetUserIds: string[],
): Promise<Set<string>> {
  if (!mongoose.isValidObjectId(viewerId) || targetUserIds.length === 0) {
    return new Set();
  }

  const follows = await FollowModel.find({
    followerId: viewerId,
    followingId: { $in: targetUserIds },
  }).exec();

  return new Set(follows.map((f) => f.followingId.toString()));
}

export async function getFollowers(
  userId: string,
  options: FollowListOptions
) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new HttpError(400, "id is invalid");
  }

  const userExists = await UserModel.exists({ _id: userId });

  if (!userExists) {
    throw new HttpError(404, "user not found");
  }

  const skip = (options.page - 1) * options.limit;

  const [followItems, total] = await Promise.all([
    FollowModel.find({ followingId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .exec(),
    FollowModel.countDocuments({ followingId: userId }).exec(),
  ]);

  const followerIds = followItems.map((item) => item.followerId.toString());

  const users = await UserModel.find({
    _id: { $in: followerIds },
  }).exec();

  const usersMap = new Map(users.map((user) => [user._id.toString(), user]));

  const orderedUsers = followerIds
    .map((id) => usersMap.get(id))
    .filter((user) => user !== undefined);

  return {
    items: orderedUsers.map((user) => toPublicUser(user)),
    meta: {
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}

export async function getFollowing(
  userId: string,
  options: FollowListOptions
) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new HttpError(400, "id is invalid");
  }

  const userExists = await UserModel.exists({ _id: userId });

  if (!userExists) {
    throw new HttpError(404, "user not found");
  }

  const skip = (options.page - 1) * options.limit;

  const [followItems, total] = await Promise.all([
    FollowModel.find({ followerId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .exec(),
    FollowModel.countDocuments({ followerId: userId }).exec(),
  ]);

  const followingIds = followItems.map((item) => item.followingId.toString());

  const users = await UserModel.find({
    _id: { $in: followingIds },
  }).exec();

  const usersMap = new Map(users.map((user) => [user._id.toString(), user]));

  const orderedUsers = followingIds
    .map((id) => usersMap.get(id))
    .filter((user) => user !== undefined);

  return {
    items: orderedUsers.map((user) => toPublicUser(user)),
    meta: {
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}