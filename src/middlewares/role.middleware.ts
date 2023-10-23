import { messages } from "../utils/error.messages";
import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

export const roleMiddleware =
  (permissions: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    // Get the JWT token from the request headers or query parameters
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: messages.accessDenied });
    }

    // Verify and decode the JWT token
    const decodedToken: any = jwt.verify(token, process.env.SECRET as string);

    // Extract the user role id from the decoded token
    const { userRolePermissions } = decodedToken;

    const permissionsObject = permissions.reduce((acc: any, perm) => {
      acc[perm] = perm;
      return acc;
    }, {});

    const samePermsLength = userRolePermissions.filter(
      (perm: any) => permissionsObject[perm]
    ).length;

    // Check if role has permissions for the endpoint
    if (samePermsLength !== permissions.length) {
      return res.status(401).json({ error: messages.accessDenied });
    }

    return next();
  };
