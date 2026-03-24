export type UserRole = "user";

export type PublicUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  website: string;
  avatarUrl: string;
  role: UserRole;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProfileStats = {
  postsCount: number;
  followersCount: number;
  followingCount: number;
};

export type ProfilePostPreview = {
  id: string;
  imageUrl: string;
};

export type MyProfileData = {
  user: PublicUser;
  stats: ProfileStats;
  posts: ProfilePostPreview[];
};

export type ProfilePostsData = {
  items: ProfilePostPreview[];
  total: number;
};

export type EditProfileFormValues = {
  fullName: string;
  bio: string;
  website: string;
  avatarUrl: string;
};