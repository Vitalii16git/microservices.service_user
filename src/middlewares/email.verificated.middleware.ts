import { Request, Response, NextFunction } from "express";
import { getUserByEmail } from "../models/user.model";
import { messages } from "../utils/error.messages";

export const emailVerificatedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  // Check if the email is registered
  const user = await getUserByEmail(email);

  if (!user) {
    return res.status(404).json({ message: messages.userNotFound });
  }

  // Compare the provided verification code with the stored one
  if (!user.isEmailVerified) {
    return res.status(400).json({ message: messages.userNotActivated });
  }

  return next();
};
