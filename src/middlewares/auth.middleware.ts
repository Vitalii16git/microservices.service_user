import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { messages } from "../utils/error.messages";
import { ExtendedRequest } from "../utils/interfaces";

// interface ExtendedRequest extends Request {
//   userId?: string;
//   userRolePermissions: string[];
// }

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

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.SECRET as string);
  } catch (error: any) {
    // handler when token expired
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: messages.tokenExpired });
    }
  }

  // Handle token verification errors
  if (!decodedToken || typeof decodedToken === "string") {
    return res.status(401).json({ message: messages.invalidToken });
  }

  // Attach the user ID to the request object
  req.userId = decodedToken.userId;
  req.userRolePermissions = decodedToken.userRolePermissions;

  // Proceed to the next middleware or route handler
  next();

  return;
};
