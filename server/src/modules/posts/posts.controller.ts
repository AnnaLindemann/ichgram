import type { Response, Request } from "express";
import type { CreatePostInput, PostDto } from "./posts.type.js";
import { UserModel } from "../users/users.model.js";
import { PostModel } from "./posts.model.js";
import  mongoose, { Types } from "mongoose";



type CreatePostBody = {
  authorId: unknown;
 imageUrl: unknown;
 caption?: unknown;
}

export async function createPost(req: Request, res: Response): Promise<void> {
  const body = req.body as CreatePostBody;

  if (req.body === null || typeof req.body !== "object") {
    res.status(400).json({ok: false, error: "Body has to be Object"})
    return
  }
   if(typeof body.authorId !== "string" || body.authorId.trim() === ""){
    res.status(400).json({ok: false, error: "authorIs is required"})
    return
  }
  
   if(!Types.ObjectId.isValid(body.authorId)){
    res.status(400).json({ok: false, error: "Body is invalid"})
    return
  }

  if(typeof body.imageUrl !== "string" || body.imageUrl.trim().length < 1){
    res.status(400).json({ok: false, error: "imageUrl is required"})
    return
  }

  if(body.caption !== undefined){
   if(typeof body.caption !== "string" || body.caption.length >= 200){
    res.status(400).json({ok: false, error: "caption has to be string"})
    return
  }
}
  const existed = await UserModel.findById(body.authorId)

    if(!existed){
       res.status(404).json({ok: false, error: "author is not exists"})
    return
    
  }

  const input: CreatePostInput = {
  authorId: body.authorId,
  imageUrl: body.imageUrl,
  caption: body.caption ?? "",
}
 
    const created = await PostModel.create({
      author: new Types.ObjectId(input.authorId),
      imageUrl: input.imageUrl,
      caption: input.caption ?? "",
    })
    const dto: PostDto = {
      id: created._id.toString(),
      authorId: created.author.toString(),
       caption: created.caption,
      imageUrl: created.imageUrl,
       createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    }
        
    res.status(201).json({
      ok:true,
      data:dto,
})

}

export async function getPostById(req: Request, res: Response): Promise<void>{
const {id} = req.params

if(typeof id !== "string" || id.trim() === ""){
  res.status(400).json({ok: false, error: "id is required"})
  return
}

if(!mongoose.isValidObjectId(id)){
  res.status(400).json({ok:false, error: "post is invalid"})
  return
}

const post = await PostModel.findById(id).exec()

if (!post){
  res.status(404).json({ok: false, error: "post not found"})
  return
}
const data: PostDto = {
  id: post._id.toString(),
  authorId: post.author.toString(),
  caption: post.caption,
  imageUrl: post.imageUrl,
  createdAt: post.createdAt.toISOString(),
  updatedAt: post.updatedAt.toISOString(),
    }
res.status(200).json({ok: true, data})

}


export async function listPosts(_req: Request, res:Response): Promise<void> {
  const posts = await PostModel.find()
  .sort({createdAt: -1})
  .limit(20)
  .exec()

  res.status(200).json({
    ok: true,
    data: posts.map((p) => ({
      id: p._id.toString(),
      authorId: p.author.toString(),
      imageUrl: p.imageUrl,
      caption: p.caption,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
  }))
})
}