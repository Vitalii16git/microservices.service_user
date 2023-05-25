// user-controller.ts
import { Request, Response } from "express";

class UserController {
  async createUser(req: Request, res: Response) {
    try {
      // Logic for user registration
      const { email, password } = req.body;

      // Perform validation
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      // Perform database insertion
      // Insert the user data into the users table using the `db` object from the database microservice
      db("users")
        .insert({ email, password })
        .then(() => {
          res.status(200).json({ message: "User registered successfully" });
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      // Logic for user login
      const { email, password } = req.body;

      // Perform validation
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      // Perform authentication
      // Query the database to check if the email and password combination is valid
      db("users")
        .where({ email, password })
        .first()
        .then((user) => {
          if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
          }

          // Authentication successful
          res.status(200).json({ message: "User logged in successfully" });
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async authorizeUser(req: Request, res: Response) {
    try {
      // Logic for user authorization
      const { token } = req.headers;

      // Perform token validation
      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Perform authorization
      // Check if the token is valid and corresponds to an authorized user

      // Example: Check if the token matches a user session stored in Redis
      redisClient.get(token, (err, userId) => {
        if (err || !userId) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        // Authorization successful
        res.status(200).json({ message: "User authorized successfully" });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
