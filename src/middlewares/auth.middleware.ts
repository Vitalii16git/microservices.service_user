import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Retrieve the token from the request headers or other sources
  const token = req.headers.authorization?.split(" ")[1];

  // Check if the token exists
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Verify the token
  const decodedToken = jwt.verify(token, process.env.SECRET as string);

  // Handle token verification errors
  if (!decodedToken) {
    return res.status(401).json({ message: "Invalid token" });
  }

  // Attach the user ID to the request object
  req.userId = decodedToken.userId;

  // Proceed to the next middleware or route handler
  next();
};
