import { Request, Response, NextFunction } from "express";
import { db } from "../config/database";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../utils/functions";
import { getUserByEmail, getUserById, getUserList } from "../models/user.model";
import jwt from "jsonwebtoken";
import { messages } from "../utils/error.messages";
import { IUser } from "../utils/interfaces";
import { userRolePermissions } from "../models/role.model";

export const register = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  // Check if the email is already registered
  const existingUser = await db("users").where({ email }).first();
  if (existingUser) {
    res.status(400).json({ message: messages.emailRegistered });
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate a verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // Insert the new user into the database
  const newUser: IUser = {
    email,
    password: hashedPassword,
    verificationCode,
  };

  // Send verification email with the verification code
  const emailConfirm: boolean = await sendVerificationEmail(
    email,
    verificationCode
  );

  if (!emailConfirm) {
    res.status(400).json({ message: messages.errorVerificationCode });
    return;
  }

  await db("users").insert(newUser);

  const {
    password: excludedPass,
    verificationCode: excludedCode,
    ...responseUser
  } = newUser;

  res.status(201).json(responseUser);
};

export const login = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  // get user by email
  const user = await getUserByEmail(email);

  // Check if the user is banned
  if (user.isBanned) {
    res.status(403).json({ message: messages.userBanned });
    return;
  }

  // Check if the password is correct
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(401).json({ message: messages.incorrectPassword });
    return;
  }

  // handler for permissions function
  userRolePermissions(user.roleId).catch((err) => {
    return res.status(401).json({ message: err.message });
  });

  // Generate a JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      userRolePermissions: await userRolePermissions(user.roleId),
    },
    process.env.SECRET!,
    {
      expiresIn: "1h", // Set the token expiration time
    }
  );

  // Generate a refresh token
  const refreshToken = jwt.sign(
    { userId: user.id, userRolePermissions: userRolePermissions(user.roleId) },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d", // Set the refresh token expiration time
    }
  );

  // Update the refresh token in the user's record
  await db("users").where({ id: user.id }).update({ refreshToken });

  // Include the access token and refresh token in the response
  res.status(200).json({ token, refreshToken });
  return;
};

export const getUsers = async (
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const users = await getUserList();

  res.json(users);
  return;
};

export const getUser = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  const user = await getUserById(id, res);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const { password, ...responseUser } = user;

  res.status(200).json(responseUser);
  return;
};

export const emailVerification = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { verificationCode } = req.body;

  const user = await getUserById(id, res);

  if (!verificationCode) {
    res.status(400).json({ message: messages.badRequest });
    return;
  }

  const verification = verificationCode === user.verificationCode;
  if (verification) {
    user.isEmailVerified = true;
  }

  if (!verification) {
    res.json({ message: messages.verificationCodeIncorrect });
    return;
  }

  // Update the user in the database
  await db("users").where({ id }).update(user);

  // Retrieve the updated user from the database
  const updatedUser = await db("users").where({ id }).first();

  const { password: excludedPassword, ...responseUser } = updatedUser;

  res.status(200).json(responseUser);
  return;
};

export const updateUser = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { email, password, name, address, tags } = req.body;

  // user presence check
  await getUserById(id, res);

  // Create an object to hold the updated user fields
  const updatedUser: any = {};

  if (email) {
    updatedUser.email = email;
  }

  if (password) {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    updatedUser.password = hashedPassword;
  }

  if (name) {
    updatedUser.name = name;
  }

  if (address) {
    updatedUser.address = address;
  }

  if (tags) {
    updatedUser.tags = tags;
  }

  if (Object.keys(updatedUser).length === 0) {
    res.status(400).json({ message: messages.badFieldsName });
    return;
  }

  // Update the user in the database
  await db("users").where({ id }).update(updatedUser);

  // Retrieve the updated user from the database
  const updatedUserData = getUserById(id, res);

  res.status(200).json(updatedUserData);
  return;
};

export const deleteUser = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  const deletedUser = await getUserById(id, res);

  // Delete the user from the database
  await db("users").where({ id }).del();

  res.status(200).json(deletedUser);
  return;
};
