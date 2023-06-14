import { Request, Response, NextFunction } from "express";
import userService from "../services/user.service.ts";

class UserController {
  async register(req: Request, res: Response, next: NextFunction) {
    return userService.register(req, res, next);
  }
  async login(req: Request, res: Response, next: NextFunction) {
    return userService.login(req, res, next);
  }
  async getUsers(req: Request, res: Response, next: NextFunction) {
    return userService.getUsers(req, res, next);
  }
  async getUser(req: Request, res: Response, next: NextFunction) {}
}

export default new UserController();
