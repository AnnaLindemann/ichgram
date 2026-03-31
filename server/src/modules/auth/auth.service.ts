import { UserModel } from "../users/users.model.js";
import {
  generateResetPasswordToken,
  getResetPasswordExpiresAt,
} from "../../shared/reset-password.helper.js";
import bcrypt from "bcrypt";
import { HttpError } from "../../shared/http-error.js";

const PASSWORD_SALT_ROUNDS = 10;

type ForgotPasswordResult = {
  resetToken: string | null;
};

export async function forgotPasswordService(
  identifier: string
): Promise<ForgotPasswordResult> {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  const user = await UserModel.findOne({
    $or: [
      { email: normalizedIdentifier },
      { usernameNormalized: normalizedIdentifier },
      { username: normalizedIdentifier },
    ],
  }).exec();

  if (!user) {
    return {
      resetToken: null,
    };
  }

  const resetToken = generateResetPasswordToken();
  const resetPasswordExpires = getResetPasswordExpiresAt();

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetPasswordExpires;

  await user.save();

  return {
    resetToken:
      process.env.NODE_ENV === "development" ? resetToken : null,
  };
}

export async function resetPasswordService(
  token: string,
  password: string
): Promise<void> {
  const normalizedToken = token.trim();

  const user = await UserModel.findOne({
    resetPasswordToken: normalizedToken,
  }).exec();

  if (!user) {
    throw new HttpError(400, "invalid or expired reset token");
  }

  if (!user.resetPasswordExpires) {
    throw new HttpError(400, "invalid or expired reset token");
  }

  const now = new Date();

  if (user.resetPasswordExpires.getTime() < now.getTime()) {
    throw new HttpError(400, "invalid or expired reset token");
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  user.passwordHash = passwordHash;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();
}