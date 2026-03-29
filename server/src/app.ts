import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import path from "node:path";
import { usersRouter } from "./modules/users/users.routes.js";
import { postRouter } from "./modules/posts/posts.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { commentsRouter } from "./modules/comments/comments.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { chatRouter } from "./modules/chat/chat.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";

export function createApp(){
  const app = express();
 
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
); 
app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json({limit: "2mb"}));
  app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    setHeaders(res) {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);
  app.use("/api/users",usersRouter)
  app.use("/api/posts",postRouter)
  app.use("/api/auth", authRouter);
  app.use("/api/posts", commentsRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/notifications", notificationsRouter);
  
app.get("/api/health", (_req, res) => {
  const state = mongoose.connection.readyState;
  const dbUp = state === 1;

  if (!dbUp) {
    res.status(503).json({
      ok: false,
      error: "database is not connected",
    });
    return;
  }

  res.status(200).json({
    ok: true,
    data: {
      status: "ok",
      database: "connected",
    },
  });
});
  
app.use(errorMiddleware);

  return app;
  }