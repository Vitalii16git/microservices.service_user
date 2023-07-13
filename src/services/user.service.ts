import { Request, Response, NextFunction } from "express";
import { db } from "../config/database";
import bcrypt from "bcrypt";
import Functions from "../utils/functions";
import jwt from "jsonwebtoken";
import { messages } from "../utils/error.messages";
import { redisClient } from "../config/redis";

export async function register(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const { email, password } = req.body;

  // Check if the email is already registered
  const existingUser = await db("users").where({ email }).first();
  if (existingUser) {
    return res.status(400).json({ message: messages.emailRegistered });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate a verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // Insert the new user into the database
  let newUser = {
    email,
    password: hashedPassword,
    verificationCode,
  };

  // Send verification email with the verification code
  const emailConfirm: any = await Functions.sendVerificationEmail(
    email,
    verificationCode
  );

  if (emailConfirm) {
    await db("users").insert(newUser);

    await redisClient.set(`user:${email}`, JSON.stringify(newUser));
    await redisClient.expire(`user:${email}`, 24 * 3600); // 1 day

    const {
      password: excludedPass,
      verificationCode: excludedCode,
      ...responseUser
    } = newUser;

    return res.status(201).json(responseUser);
  }
  return;
}

export async function login(req: Request, res: Response, _next: NextFunction) {
  const { email, password } = req.body;

  // Check if the user data exists in the cache
  let user: any = await redisClient.get(email);

  if (user) {
    user = JSON.parse(user);
  }

  if (!user) {
    // User data is not available in the cache, fetch it from the database
    user = await Functions.getUserByEmail(email);

    // Check if the user is banned
    if (user.isBanned) {
      return res.status(403).json({ message: messages.userBanned });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: messages.incorrectPassword });
    }

    // Save the user data in the cache for future use
    await redisClient.set(`user:${email}`, JSON.stringify(user));
    await redisClient.expire(`user:${email}`, 24 * 3600); // 1 day
  }

  // Generate a JWT token
  const token = jwt.sign(
    { userId: user.id, userRole: user.role },
    process.env.SECRET!,
    {
      expiresIn: "1h", // Set the token expiration time
    }
  );

  // Generate a refresh token
  const refreshToken = jwt.sign(
    { userId: user.id, userRole: user.role },
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
}

export async function getUsers(
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Check if the users data exists in the cache
  let users: any = await redisClient.get("users");

  if (!users) {
    // Users data is not available in the cache, fetch it from the database
    users = await Functions.getUsers();

    // Save the users data in the cache for future use
    await redisClient.set("users", JSON.stringify(users));
    await redisClient.expire("users", 24 * 3600); // 1 day
  }

  if (users) {
    users = JSON.parse(users);
  }

  res.json(users);
  return;
}

export async function getUser(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const { id } = req.params;

  // Check if the user data exists in the cache
  let user: any = await redisClient.get(`user:${id}`);

  if (!user) {
    // User data is not available in the cache, fetch it from the database
    user = await Functions.getUserById(id, res);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save the user data in the cache for future use
    await redisClient.set(`user:${id}`, JSON.stringify(user));
    await redisClient.expire(`user:${id}`, 24 * 3600); // 1 day
  }

  if (user) {
    user = JSON.parse(user);
  }

  const { password, ...responseUser } = user;

  res.status(200).json(responseUser);
  return;
}

export async function emailVerification(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const { id } = req.params;
  const { verificationCode } = req.body;

  const user = await Functions.getUserById(id, res);

  if (!verificationCode) {
    return res.status(400).json({ message: messages.badRequest });
  }

  const verification = verificationCode === user.verificationCode;
  if (verification) {
    user.isEmailVerified = true;
  }

  if (!verification) {
    return res.json({ message: messages.verificationCodeIncorrect });
  }

  // Update the user in the database
  await db("users").where({ id }).update(user);

  // Retrieve the updated user from the database
  const updatedUser = await db("users").where({ id }).first();

  const { password: excludedPassword, ...responseUser } = updatedUser;

  res.status(200).json(responseUser);
  return;
}

export async function updateUser(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const { id } = req.params;
  const { email, password, name, role, address, tags } = req.body;

  // user presence check
  await Functions.getUserById(id, res);

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

  if (role) {
    updatedUser.role = role;
  }

  if (address) {
    updatedUser.address = address;
  }

  if (tags) {
    updatedUser.tags = tags;
  }

  if (Object.keys(updatedUser).length === 0) {
    return res.status(400).json({ message: messages.badFieldsName });
  }

  // Update the user in the database
  await db("users").where({ id }).update(updatedUser);

  // Retrieve the updated user from the database
  const updatedUserData = Functions.getUserById(id, res);

  // set cache
  await redisClient.set(`user:${id}`, JSON.stringify(updatedUserData));
  await redisClient.expire(`user:${id}`, 24 * 3600); // 1 day

  res.status(200).json(updatedUserData);
  return;
}

export async function deleteUser(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const { id } = req.params;

  const deletedUser = await Functions.getUserById(id, res);

  // Delete the user from the database
  await db("users").where({ id }).del();

  // delete cache
  await redisClient.srem(`user:${id}`, deletedUser);

  res.status(200).json(deletedUser);
  return;
}

// function for testing redis
export async function checkRedis(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const { email } = req.body;
  let check = await redisClient.get(email);

  if (check) {
    check = JSON.parse(check);
  }

  res.status(200).json(check);
  return;
}
