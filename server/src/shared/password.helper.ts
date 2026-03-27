import bcrypt from "bcrypt";

const PASSWORD_SALT_ROUNDS = 10;
const PASSWORD_MAX_LENGTH = 72;

function assertPasswordLength(password: string): void {
  if (password.length > PASSWORD_MAX_LENGTH) {
    throw new Error(`Password must be at most ${PASSWORD_MAX_LENGTH} characters long`);
  }
}

export function hashPassword(password: string): Promise<string> {
  assertPasswordLength(password);

  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

export function comparePassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  assertPasswordLength(password);

  return bcrypt.compare(password, passwordHash);
}