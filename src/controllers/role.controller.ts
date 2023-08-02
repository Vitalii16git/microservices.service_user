import { Request, Response, NextFunction } from "express";
import {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
} from "../services/role.service";

class RoleController {
  async createRole(req: Request, res: Response, next: NextFunction) {
    return createRole(req, res, next);
  }
  async getRoles(req: Request, res: Response, next: NextFunction) {
    return getRoles(req, res, next);
  }
  async getRole(req: Request, res: Response, next: NextFunction) {
    return getRole(req, res, next);
  }
  async updateRole(req: Request, res: Response, next: NextFunction) {
    return updateRole(req, res, next);
  }
  async deleteRole(req: Request, res: Response, next: NextFunction) {
    return deleteRole(req, res, next);
  }
}

export default new RoleController();
