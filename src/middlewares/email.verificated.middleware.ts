import { Request, Response, NextFunction } from "express";
import Functions from "../utils/functions";
import { messages } from "../utils/error.messages";

export const emailVerificatedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  // Check if the email is registered
  const user = await Functions.getUserByEmail(email, res);

  // Compare the provided verification code with the stored one
  if (!user.isEmailVerified) {
    return res.status(400).json({ message: messages.userNotActivated });
  }

  // Proceed to the next middleware
  next();

  return;
};
