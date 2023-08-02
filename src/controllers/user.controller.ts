import { Request, Response, NextFunction } from "express";
import {
  register,
  login,
  getUsers,
  getUser,
  emailVerification,
  updateUser,
  deleteUser,
} from "../services/user.service";
// import { IUser } from "../utils/interfaces";

class UserController {
  async register(req: Request, res: Response, next: NextFunction) {
    return register(req, res, next);
  }
  async login(req: Request, res: Response, next: NextFunction) {
    return login(req, res, next);
  }
  async getUsers(req: Request, res: Response, next: NextFunction) {
    return getUsers(req, res, next);
  }
  async getUser(req: Request, res: Response, next: NextFunction) {
    return getUser(req, res, next);
  }
  async emailVerification(req: Request, res: Response, next: NextFunction) {
    return emailVerification(req, res, next);
  }
  async updateUser(req: Request, res: Response, next: NextFunction) {
    return updateUser(req, res, next);
  }
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    return deleteUser(req, res, next);
  }
}

export default new UserController();
