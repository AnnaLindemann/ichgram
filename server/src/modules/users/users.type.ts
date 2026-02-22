export type User = {
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

export type CreateUserInput = {
  email: string;
  username: string;
  passwordHash: string;
}