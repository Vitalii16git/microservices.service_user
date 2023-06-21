import { Request, Response, NextFunction } from "express";
import userService from "../services/user.service";

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
  async getUser(req: Request, res: Response, next: NextFunction) {
    return userService.getUsers(req, res, next);
  }
  async emailVerification(req: Request, res: Response, next: NextFunction) {
    return userService.emailVerification(req, res, next);
  }
  async updateUser(req: Request, res: Response, next: NextFunction) {
    return userService.updateUser(req, res, next);
  }
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    return userService.deleteUser(req, res, next);
  }
}

export default new UserController();
