import "dotenv/config";
import http from "http";
import { createApp } from "./app.js";
import { connectMongoose } from "./db/connectMongo.js";
import { initSocketServer } from "./sockets/socket.server.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI is missing");
}

const app = createApp();

await connectMongoose(uri);

const httpServer = http.createServer(app);

initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});