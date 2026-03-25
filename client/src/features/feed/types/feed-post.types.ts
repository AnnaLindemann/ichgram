export type FeedPost = {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
  isFollowingAuthor: boolean;
  likedByMe: boolean;

  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };

  likesCount: number;
  commentsCount: number;
};