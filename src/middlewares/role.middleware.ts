import { messages } from "./../utils/error.messages";
import { Request, Response, NextFunction } from "express";
import { db } from "../config/database";
import jwt from "jsonwebtoken";

export const roleMiddleware =
  (endpointName: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    // Get the JWT token from the request headers or query parameters
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: messages.accessDenied });
    }

    // Verify and decode the JWT token
    const decodedToken: any = jwt.verify(token, process.env.SECRET as string);

    // Extract the userRole from the decoded token
    const { userRole } = decodedToken;

    const role = await db("roles")
      .select("permissions")
      .where("name", userRole)
      .first();

    // Check if role has permissions for the endpoint
    if (!role || !role.permissions.includes(endpointName)) {
      return res.status(401).json({ error: messages.accessDenied });
    }

    // Proceed to the next middleware
    next();

    return;
  };
