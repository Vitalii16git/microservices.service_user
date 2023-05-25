import express, { Request, Response, Application, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {
  createUser,
  loginUser,
  authorizeUser,
} from "../controllers/user.controller.ts";

const app: Application = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(bodyParser.json());

app.post("/users/register", createUser);
app.post("/users/login", loginUser);
app.get("/users/authorize", authorizeUser);

app.listen(3001, () => {
  console.log("User microservice is running on port 3001");
});

app.listen(PORT, () => {
  console.log(`Service is running on port ${PORT}`);
});
