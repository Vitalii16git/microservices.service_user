import { Request, Response, NextFunction } from "express";
import { db } from "../config/database";
import { messages } from "../utils/error.messages";
import Functions from "../utils/functions";
import { redisClient } from "../config/redis";

class RoleService {
  async createRole(req: Request, res: Response, _next: NextFunction) {
    let { name, permissions } = req.body;

    // Check if the role already exists
    const role = await Functions.getRoleByName(name);

    if (role) {
      return res.status(400).json({ message: messages.roleExists });
    }

    // Insert the new role into the database
    const id = await db("roles").insert({
      name,
    });

    // Store the role in Redis for caching or other purposes
    await redisClient.set(
      `role:${id}`,
      JSON.stringify({ id, name, permissions })
    );
    await redisClient.expire(`role:${id}`, 24 * 3600); // 1 day

    res.status(201).json({ id, name, permissions });
    return;
  }

  async getRoles(_req: Request, res: Response, _next: NextFunction) {
    const cachedRoles = await redisClient.get("roles");

    if (cachedRoles) {
      const roles = JSON.parse(cachedRoles);
      return res.status(200).json(roles);
    }

    // Retrieve the roles from the database
    const roles = await Functions.getRoles();

    // Store the roles in Redis for caching
    await redisClient.set("roles", JSON.stringify(roles));
    await redisClient.expire(`roles`, 24 * 3600); // 1 day

    return res.status(200).json(roles);
  }

  async getRole(req: Request, res: Response, _next: NextFunction) {
    const { id } = req.params;

    // Check if the role is stored in Redis
    const cachedRole = await redisClient.get(`role:${id}`);

    if (cachedRole) {
      const role = JSON.parse(cachedRole);
      return res.status(200).json(role);
    }

    // Retrieve the role from the database
    const role = await Functions.getRoleById(id);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Store the role in Redis for caching
    await redisClient.set(`role:${id}`, JSON.stringify(role));
    await redisClient.expire(`role:${id}`, 24 * 3600); // 1 day

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

    // set cache
    await redisClient.set(
      `role:${id}`,
      JSON.stringify({ id, name, permissions: updatedPermissions })
    );
    await redisClient.expire(`role:${id}`, 24 * 3600); // 1 day

    res.status(200).json({ id, name, permissions: updatedPermissions });
    return;
  }

  async deleteRole(req: Request, res: Response, _next: NextFunction) {
    const { id } = req.params;

    // Delete the role from the database
    const deletedRole = await db("roles").where({ id }).del();

    // delete cache
    await redisClient.srem(`role:${id}`, deletedRole);

    res.status(204).json(deletedRole);
    return;
  }
}

export default new RoleService();
