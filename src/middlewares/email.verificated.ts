import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import Functions from "../utils/functions";

export const verifyCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, verificationCode } = req.body;

  // Check if the email is registered
  const user = await Functions.getUserByEmail(email, res);

  // Compare the provided verification code with the stored one
  const isCodeValid = await bcrypt.compare(
    verificationCode,
    user.verificationCode
  );

  if (!isCodeValid) {
    return res.status(400).json({ message: "Invalid verification code" });
  }

  // Proceed to the next middleware
  next();
};
