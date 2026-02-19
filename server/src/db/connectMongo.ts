import mongoose from "mongoose"

export async function connectMongoose(uri: string) : Promise<void>{
   try {
  await mongoose.connect(uri);
    console.log("Mongo is connected");
  } catch(err){
    console.error("Mongo connection is failed", err);
    throw err;
  }
}