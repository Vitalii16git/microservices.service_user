import supertest from "supertest";
import express from "express";
import { db } from "../config/database"; // Import your database connection
import {
  register,
  login,
  getUser,
  emailVerification,
  updateUser,
  deleteUser,
} from "../services/user.service"; // Import your register function
import bcrypt from "bcrypt";

const app = express();

app.use(express.json());
app
  .post("/register", register)
  .post("/login", login)
  .get("/:id", getUser)
  .put("/verification/:id", emailVerification)
  .put("/update/:id", updateUser)
  .delete("/delete/:id", deleteUser);

const randomNum = Math.floor(Math.random() * 100000000);
const email = `test${randomNum}@example.com`;

const newUser = {
  email,
  password: "testPassword",
};

const testUser = {
  id: 123456,
  email: "user123456@example123456.com",
  password: "123password456",
  name: "Bob",
  address: "123456",
  isEmailVerified: false,
  isBanned: false,
  verificationCode: "123456",
};

beforeAll(async () => {
  await db.migrate.latest(); // Run the latest migrations

  const existingUser = await db("users")
    .where({ email: testUser.email })
    .first();

  if (!existingUser) {
    console.log(1);

    await db("users").insert(testUser);
  }
});

afterAll(async () => {
  await db.destroy(); // Close the database connection
});

describe("Integration Test for register function", () => {
  describe("Register given created user", () => {
    it("should register a new user", async () => {
      let { password } = newUser;
      password = await bcrypt.hash(password, 7);

      const response = await supertest(app)
        .post("/register")
        .send(newUser)
        .expect(201); // Expecting a successful registration (status code 201)

      expect(response.body).toEqual(expect.objectContaining({ email }));
    });
  });

  describe("Register handle exceptions", () => {
    it("should handle existing user registration", async () => {
      // Create a user with the same email in the database to simulate an existing user

      await supertest(app).post("/register").send(newUser).expect(400); // Expecting a status code 400 for existing user error
    });
  });
});

describe("Integration Test for login function", () => {
  describe("Login given valid credentials", () => {
    it("should return a valid JWT token and refreshToken", async () => {
      const randomNum = Math.floor(Math.random() * 100000000);
      const email = `test${randomNum}@example.com`;
      const password = "testPassword";

      // Create a user in the database
      await db("users").insert({
        email,
        password: await bcrypt.hash(password, 7),
        isEmailVerified: true,
      });

      const credentials = {
        email,
        password,
      };

      const response = await supertest(app)
        .post("/login")
        .send(credentials)
        .expect(200);
      // Expecting a successful login (status code 200)

      // Validate the response contains the expected properties (token and refreshToken)
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refreshToken");
    });
  });

  describe("Login handle exceptions", () => {
    it("should handle a banned user", async () => {
      // Create a banned user in the database
      const randomNum = Math.floor(Math.random() * 100000000);
      const email = `banned${randomNum}@example.com`;
      const password = "testPassword";

      await db("users").insert({
        email,
        password: await bcrypt.hash(password, 7),
        isBanned: true,
      });

      const credentials = {
        email,
        password,
      };

      await supertest(app).post("/login").send(credentials).expect(403); // Expecting a forbidden response (status code 403)
    });

    it("should handle incorrect password", async () => {
      const credentials = {
        email,
        password: "incorrectpassword", // Provide an incorrect password
      };

      await supertest(app).post("/login").send(credentials).expect(401); // Expecting an unauthorized response (status code 401)
    });
  });
});

describe("Integration Test for getUser function", () => {
  describe("User Found", () => {
    it("should return user details for an existing user", async () => {
      const response = await supertest(app).get(`/${testUser.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ email }));
    });
  });

  describe("User Not Found", () => {
    it("should handle a non-existing user", async () => {
      const response = await supertest(app).get("/nonexistent-user");

      expect(response.status).toBe(400);
    });
  });
});

describe("Integration Test for emailVerification function", () => {
  describe("Successful Verification", () => {
    it("should verify email with correct verification code", async () => {
      const response = await supertest(app)
        .put(`/verification/${testUser.id}`)
        .send({ verificationCode: testUser.verificationCode });

      expect(response.status).toBe(200);
      expect(response.body.isEmailVerified).toBe(1);
    });
  });

  describe("Bad Request", () => {
    it("should handle missing verification code", async () => {
      const response = await supertest(app)
        .put(`/verification/${testUser.id}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it("should handle incorrect verification code", async () => {
      const response = await supertest(app)
        .put(`/verification/${testUser.id}`)
        .send({ verificationCode: "incorrect-code" });

      expect(response.status).toBe(400);
    });
  });
});
