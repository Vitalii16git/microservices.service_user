import { Request, Response, NextFunction } from "express";
import { db } from "../config/database";
import { messages } from "../utils/error.messages";
import Functions from "../utils/functions";

class RoleService {
  async createRole(req: Request, res: Response, _next: NextFunction) {
    let { name, permissions } = req.body;

    // Check if the role already exists
    await Functions.getRoleByName(name, res);

    // Insert the new role into the database
    const id = await db("roles").insert({
      name,
    });

    res.status(201).json({ id, name, permissions });
    return;
  }

  async getRoles(_req: Request, res: Response, _next: NextFunction) {
    const roles = await Functions.getRoles();

    return res.status(200).json(roles);
  }

  async getRole(req: Request, res: Response, _next: NextFunction) {
    const { id } = req.params;

    // Retrieve the role from the database
    const role = await Functions.getRoleById(id, res);

    res.status(200).json(role);
    return;
  }

  async updateRole(req: Request, res: Response, _next: NextFunction) {
    const { id } = req.params;
    const { permissions } = req.body;

    // Retrieve the current permissions of the role
    const existingRole = await db("roles").where({ id }).first();
    if (!existingRole) {
      return res.status(404).json({ message: messages.roleNotFound });
    }

    const { name, permissions: existingPermissions } = existingRole;

    // Combine the existing permissions with the new permissions
    const updatedPermissions = [...existingPermissions, ...permissions];

    // Update the role in the database with the updated permissions
    await db("roles")
      .where({ id })
      .update({ permissions: JSON.stringify(updatedPermissions) });

    res.status(200).json({ id, name, permissions: updatedPermissions });
    return;
  }

  async deleteRole(req: Request, res: Response, _next: NextFunction) {
    const { roleId } = req.params;

    // Delete the role from the database
    const deletedRole = await db("roles").where({ id: roleId }).del();

    res.status(204).json(deletedRole);
    return;
  }
}

export default new RoleService();
