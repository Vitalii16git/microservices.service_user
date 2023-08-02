import { Request, Response, NextFunction } from "express";
import { db } from "../config/database";
import { messages } from "../utils/error.messages";
import { getRoleById, getRoleByName, getRoleList } from "../models/role.model";

export const createRole = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let { name, permissions } = req.body;

  // Check if the role already exists
  const role = await getRoleByName(name);

  if (role) {
    return res.status(400).json({ message: messages.roleExists });
  }

  // Insert the new role into the database
  await db("roles").insert({ name });

  res.status(201).json({ name, permissions });
  return;
};

export const getRoles = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const roles = await getRoleList();

  return res.status(200).json(roles);
};

export const getRole = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { id } = req.params;

  // Retrieve the role from the database
  const role = await getRoleById(id);

  if (!role) {
    return res.status(404).json({ message: messages.roleNotFound });
  }

  res.status(200).json(role);
  return;
};

export const updateRole = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
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
    .update({ permissions: { data: updatedPermissions } });

  res.status(200).json({ id, name, permissions: updatedPermissions });
  return;
};

export const deleteRole = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { roleId } = req.params;

  // Delete the role from the database
  const deletedRole = await db("roles").where({ id: roleId }).del();

  res.status(204).json(deletedRole);
  return;
};
