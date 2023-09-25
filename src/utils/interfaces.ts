import { UserRegisterValidation } from "./types";
import { classicFunctionType, middlewareType } from "./types";
import { Request } from "express";

export interface IRoutes {
  method: string;
  routeName: string;
  url: string;
  validator?: UserRegisterValidation[];
  middleware?: middlewareType[];
  controller: classicFunctionType;
}

export interface IUser {
  email: string;
  password?: string;
  verificationCode?: string;
}

export interface ExtendedRequest extends Request {
  userId?: string;
  userRolePermissions: string[];
}
