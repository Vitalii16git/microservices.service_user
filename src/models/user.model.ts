import { db } from "../config/database";
import { Response } from "express";
import { messages } from "../utils/error.messages";

export const getUserList = async () => {
  const users = await db("users").select("*");

  const responseUser = users.map((user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  return responseUser;
};

export const getUserByEmail = async (email: string) => {
  const user = await db("users").where({ email }).first();

  return user;
};

export const getUserById = async (id: string, res: Response) => {
  const user = await db("users").where({ id }).first();

  if (!user) {
    return res.status(404).json({ message: messages.userNotFound });
  }

  return user;
};
