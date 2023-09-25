import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { ExtendedRequest } from "../utils/interfaces";

// classic function type
export type classicFunctionType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// type for middleware
export type middlewareType = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => void;

// Define a custom type for the validation object
export type UserRegisterValidation = ObjectSchema<{
  email: string;
  password: string;
}>;
