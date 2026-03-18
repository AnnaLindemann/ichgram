import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { usersRouter } from "./modules/users/users.routes.js";
import { postRouter } from "./modules/posts/posts.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { commentsRouter } from "./modules/comments/comments.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export function createApp(){
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json({limit: "2mb"}));
  app.use("/api/users",usersRouter)
  app.use("/api/posts",postRouter)
  app.use("/api/auth", authRouter);
  app.use("/api/posts", commentsRouter);
  
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