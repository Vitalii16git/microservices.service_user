import { Request, Response, NextFunction } from "express";
import { knex } from "knex";
import { db } from "../config/database";
import bcrypt from "bcrypt";

// const knexConfig = knex({
//   client: "mysql2",
//   connection: {
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USER,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE,
//   },
//   useNullAsDefault: true,
// });

class UserService {
  async register(req: Request, res: Response, next: NextFunction) {
    const { email, password, name, address } = req.body;
    console.log(1);
    // Check if the email is already registered
    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    console.log(2);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Insert the new user into the database
    const newUser = {
      email,
      password: hashedPassword,
      name,
      address,
      verificationCode,
    };
    await db("users").insert(newUser);

    // TODO: Send verification email with the verification code

    res.status(201).json(newUser);
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    // Check if the email is registered
    const user = await knex("users").where({ email }).first();
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the user is banned
    if (user.isBanned) {
      return res.status(403).json({ message: "User is banned" });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful" });
  }
  async getUsers(req: Request, res: Response, next: NextFunction) {}
}

export default new UserService();
