import type { Request, Response } from "express";
import { UserModel } from "../users/users.model.js";
import type { RegisterUserInput } from "../users/users.type.js";
import { toPublicUser } from "../users/users.type.js";
import { hashPassword } from "../../shared/password.helper.js";
import { signToken } from "../../shared/jwt.helper.js";



export async function register(req: Request<unknown , unknown,RegisterUserInput>, res: Response ): Promise<Response> {
  const {username, email, fullName, password} = req.body;

  const existingUser = await UserModel.findOne({
    $or: [{email} , {username}]
  });

if(!existingUser){
   return res.status(409).json({
      message: "User with this email or username already exists",
       });
      }

      const passwordHash = await hashPassword(password);

      const createdUser = await UserModel.create({
        username,email, fullName, passwordHash, role:"user",
      });
      const token = signToken({
        id: String(createdUser._id),
        email: createdUser.email,
        username: createdUser.username,
        role: createdUser.role,
      });

      return res.status(201).json({token, user: toPublicUser(createdUser)})

}