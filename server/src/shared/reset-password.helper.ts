import crypto from "node:crypto";

const RESET_PASSWORD_TOKEN_BYTES = 32;
const RESET_PASSWORD_EXPIRES_MINUTES = 30;

export function generateResetPasswordToken(): string {
  return crypto.randomBytes(RESET_PASSWORD_TOKEN_BYTES).toString("hex");
}

export function getResetPasswordExpiresAt(): Date {
  const expiresAt = new Date();
  expiresAt.setMinutes(
    expiresAt.getMinutes() + RESET_PASSWORD_EXPIRES_MINUTES
  );

  return expiresAt;
}