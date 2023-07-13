import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { db } from "../src/config/database";
import { redisClient } from "../src/config/redis";
import Functions from "../src/utils/functions";
import { register } from "../src/services/user.service";

jest.mock("./db"); // Mock the database module
jest.mock("bcrypt"); // Mock the bcrypt module
jest.mock("./Functions"); // Mock the Functions module

describe("register", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(async () => {
    req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    } as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const mockNext: NextFunction = jest.fn();

    await register(req, res, mockNext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new user", async () => {
    const existingUser = null; // No existing user

    db.mockReturnValueOnce({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValueOnce(existingUser),
    });

    const verificationCode = "123456";

    const sendVerificationEmailMock = jest
      .spyOn(Functions, "sendVerificationEmail")
      .mockResolvedValueOnce(true);

    const insertMock = jest.fn().mockResolvedValueOnce(true);
    db.mockReturnValueOnce({ insert: insertMock });

    const setMock = jest.fn().mockResolvedValueOnce(true);
    const expireMock = jest.fn().mockResolvedValueOnce(true);
    const redisClientMock = {
      set: setMock,
      expire: expireMock,
    };
    jest.mock("redis", () => ({
      createClient: jest.fn(() => redisClientMock),
    }));

    const expectedResponse = {
      email: "test@example.com",
    };

    await register(req as Request, res as Response, next);

    expect(db).toHaveBeenCalledWith("users");
    expect(db().where).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(db().first).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(sendVerificationEmailMock).toHaveBeenCalledWith(
      "test@example.com",
      verificationCode
    );
    expect(insertMock).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "hashedPassword",
      verificationCode: verificationCode,
    });
    expect(setMock).toHaveBeenCalledWith(
      "user:test@example.com",
      JSON.stringify({
        email: "test@example.com",
        password: "hashedPassword",
        verificationCode: verificationCode,
      })
    );
    expect(expireMock).toHaveBeenCalledWith("user:test@example.com", 24 * 3600);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expectedResponse);
  });

  it("should return an error if the email is already registered", async () => {
    const existingUser = {
      email: "test@example.com",
    };

    db.mockReturnValueOnce({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValueOnce(existingUser),
    });

    await register(req as Request, res as Response, next);

    expect(db).toHaveBeenCalledWith("users");
    expect(db().where).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(db().first).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.any(String),
    });
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(Functions.sendVerificationEmail).not.toHaveBeenCalled();
    expect(db().insert).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
    expect(redisClient.expire).not.toHaveBeenCalled();
  });
});
