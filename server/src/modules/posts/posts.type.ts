export type CreatePostInput = {
authorId: string;
imageUrl: string;
caption?: string;
}

export type PostDto = {
  id: string;
  authorId: string;
  caption: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePostResponse = {
  ok:true;
  data: PostDto;
}