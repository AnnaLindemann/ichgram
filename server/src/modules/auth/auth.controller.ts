import type { Request, Response } from "express";
import { UserModel } from "../users/users.model.js";
import { toPublicUser } from "../users/users.type.js";
import { signToken } from "../../shared/jwt.helper.js";
import {
  loginSchema,
  registerSchema,
  type LoginSchemaInput,
  type RegisterSchemaInput,
} from "./auth.validation.js";
import {
  comparePassword,
  hashPassword,
} from "../../shared/password.helper.js";


export async function register(
  req: Request<unknown, unknown, RegisterSchemaInput>,
  res: Response
): Promise<void> {
const parsed = registerSchema.safeParse(req.body);

if (!parsed.success) {
 res.status(400).json({
  ok: false,
  message: "Validation failed",
  errors: parsed.error.flatten().fieldErrors,
});
return;
}

const { username, email, fullName, password } = parsed.data;
  const existingUser = await UserModel.findOne({
    $or: [{ email }, { username }],
  }).exec();

if(existingUser){
  res.status(409).json({
    ok: false,
      message: "User with this email or username already exists",
       });
       return 
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

      res.status(201).json({ok: true, data: {token, user: toPublicUser(createdUser)}}) 
      return
}


export async function login(
  req: Request<unknown, unknown, LoginSchemaInput>,
  res: Response
): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);

if (!parsed.success) {
 res.status(400).json({
  ok: false,
  message: "Validation failed",
  errors: parsed.error.flatten().fieldErrors,
});
return;
}

const {identifier, password} = parsed.data

const isEmail = identifier.includes("@");

const existingUser = await UserModel.findOne(
  isEmail ? {email: identifier} : {username: identifier}
).exec();

if(!existingUser){
    res.status(401).json({ok: false,
      message: "Invalid credentials",
       });
     return 
    }
const isPasswordCorrect= await comparePassword(password, existingUser.passwordHash)

if(!isPasswordCorrect){
  res.status(401).json({ok: false,message:"Invalid credentials"}) 
  return
}

 const token = signToken({
    id: String(existingUser._id),
    email: existingUser.email,
    username: existingUser.username,
    role: existingUser.role,
  });

   res.status(200).json({ok: true, data: {token, user: toPublicUser(existingUser)}}) 
return
}