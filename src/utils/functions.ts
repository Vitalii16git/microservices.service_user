import { messages } from "./error.messages";
import nodemailer from "nodemailer";
import logger from "./logger";
import { db } from "../config/database";
import { Response } from "express";

class Functions {
  static async sendVerificationEmail(email: string, verificationCode: string) {
    // Create a nodemailer transporter with your email configuration
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MY_GMAIL_EMAIL,
        pass: process.env.GENERATED_PASS,
      },
    });

    // Configure the email options
    const mailOptions = {
      from: process.env.MY_GMAIL_EMAIL,
      to: email,
      subject: "Account Verification",
      text: `Your verification code is: ${verificationCode}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    logger.info(`Email was sended to ${email}`);
    return true;
  }

  static async getUsers() {
    const users = await db("users").select("*");

    const responseUser = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return responseUser;
  }

  static async getUserByEmail(email: string) {
    const user = await db("users").where({ email }).first();

    return user;
  }

  static async getUserById(id: string, res: Response) {
    const user = await db("users").where({ id }).first();

    if (!user) {
      return res.status(404).json({ message: messages.userNotFound });
    }

    return user;
  }

  static async getRoles() {
    const role = await db("roles").select("*");

    return role;
  }

  static async getRoleByName(name: string) {
    const role = await await db("roles").where({ name }).first();

    return role;
  }

  static async getRoleById(id: string) {
    const role = await db("roles").where({ id }).first();

    return role;
  }
}

export default Functions;
