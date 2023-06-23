import { Request, Response, NextFunction } from "express";
import roleService from "../services/role.service";

class RoleController {
  async createRole(req: Request, res: Response, next: NextFunction) {
    return roleService.createRole(req, res, next);
  }
  async getRoles(req: Request, res: Response, next: NextFunction) {
    return roleService.getRoles(req, res, next);
  }
  async getRole(req: Request, res: Response, next: NextFunction) {
    return roleService.getRole(req, res, next);
  }
  async updateRole(req: Request, res: Response, next: NextFunction) {
    return roleService.updateRole(req, res, next);
  }
  async deleteRole(req: Request, res: Response, next: NextFunction) {
    return roleService.deleteRole(req, res, next);
  }
}

export default new RoleController();
