import "dotenv/config";
import { createApp } from "./app.js";
import { connectMongoose } from "./db/connectMongo.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const app = createApp();
const uri = process.env.MONGO_URI;
if(!uri) throw new Error("MONGO_URI is missing");
await connectMongoose(uri)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})