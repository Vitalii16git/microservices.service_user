import { db } from "../config/database";
import { messages } from "../utils/error.messages";

export const getRoleList = async () => {
  const role = await db("roles").select("*");

  return role;
};

export const getRoleByName = async (name: string) => {
  const role = await await db("roles").where({ name }).first();

  return role;
};

export const getRoleById = async (id: string) => {
  const role = await db("roles").where({ id }).first();

  return role;
};

export const userRolePermissions = async (userId: string): Promise<void> => {
  const role = await getRoleById(userId);

  if (!role) {
    throw Error(messages.roleNotFound);
  }

  return role.permissions.data;
};
