import Joi from "joi";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/error.custom";

export const validate =
  <T extends Joi.ObjectSchema>(schema: T) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        throw new CustomError(error, 400);
      }
      return next();
    } catch (error) {
      next(error);
    }
  };
