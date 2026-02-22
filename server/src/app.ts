import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { usersRouter } from "./modules/users/users.routes.js";

export function createApp(){
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json({limit: "2mb"}));
  app.use(usersRouter)
  app.get("/api/health", (_req,res)=> {
    const state = mongoose.connection.readyState;
    const dbUp = state === 1;
    if(!dbUp) {
      return res.status(503).json({ok: false, db: false, state});
    }
    return res.status(200).json({ok: true, db: true})
  });
  
  return app;
  }