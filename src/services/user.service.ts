import { Request, Response, NextFunction } from "express";
import { db } from "../config/database";
import bcrypt from "bcrypt";
import Functions from "../utils/functions";
import jwt from "jsonwebtoken";
import { messages } from "../utils/error.messages";

class UserService {
  async register(req: Request, res: Response, _next: NextFunction) {
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

      const {
        password: excludedPass,
        verificationCode: excludedCode,
        ...responseUser
      } = newUser;
      return res.status(201).json(responseUser);
    }

    return;
  }

  async login(req: Request, res: Response, _next: NextFunction) {
    const { email, password } = req.body;

    // Check if the email is registered
    const user = await Functions.getUserByEmail(email, res);

    // Check if the user is banned
    if (user.isBanned) {
      return res.status(403).json({ message: messages.userBanned });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: messages.incorrectPassword });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, userRole: user.role },
      process.env.SECRET as string,
      {
        expiresIn: "1h", // Set the token expiration time
      }
    );

    // Generate a refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, userRole: user.role },
      process.env.REFRESH_TOKEN_SECRET as string,
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

  async getUsers(_req: Request, res: Response, _next: NextFunction) {
    const users = await Functions.getUsers();

    res.json(users);
    return;
  }

  async getUser(req: Request, res: Response, _next: NextFunction) {
    const { id } = req.params;

    const user = await Functions.getUserById(id, res);

    const { password, ...responseUser } = user;

    res.status(200).json(responseUser);
    return;
  }

  async emailVerification(req: Request, res: Response, _next: NextFunction) {
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

  async updateUser(req: Request, res: Response, _next: NextFunction) {
    const { id } = req.params;
    const { email, password, name, address, tags } = req.body;

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

    res.status(200).json(updatedUserData);
    return;
  }

  async deleteUser(req: Request, res: Response, _next: NextFunction) {
    const { id } = req.params;

    const deletedUser = await Functions.getUserById(id, res);

    // Delete the user from the database
    await db("users").where({ id }).del();

    res.status(200).json(deletedUser);
  }
}

export default new UserService();
