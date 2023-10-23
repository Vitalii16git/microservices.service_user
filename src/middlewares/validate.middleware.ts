import Joi from "joi";
import { NextFunction, Request, Response } from "express";

export const validate =
  <T extends Joi.ObjectSchema>(schema: T) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(", ");
        return res.status(400).json({ error: errorMessage });
      }
      return next();
    } catch (error) {
      next(error);
    }
  };
