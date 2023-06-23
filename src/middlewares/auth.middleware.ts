import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { messages } from "../utils/error.messages";

interface ExtendedRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  // Retrieve the token from the request headers or other sources
  const token = req.headers.authorization?.split(" ")[1];

  // Check if the token exists
  if (!token) {
    return res.status(401).json({ message: messages.noTokenProvided });
  }

  // Verify the token
  const decodedToken: string | JwtPayload = jwt.verify(
    token,
    process.env.SECRET as string
  );
  if (!decodedToken) {
    return res.status(401).json({ message: messages.invalidToken });
  }

  // Handle token verification errors
  if (!decodedToken || typeof decodedToken === "string") {
    return res.status(401).json({ message: messages.invalidToken });
  }

  // Attach the user ID to the request object
  req.userId = decodedToken.userId as string;

  // Proceed to the next middleware or route handler
  next();

  return;
};
