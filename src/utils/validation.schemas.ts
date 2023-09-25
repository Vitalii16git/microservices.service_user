import Joi from "joi";
import { UserRegisterValidation } from "./types";

export const userRegisterValidation: UserRegisterValidation = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(36).required(),
});
