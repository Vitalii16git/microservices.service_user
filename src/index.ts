import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import logger from "./utils/logger";
import userRouter from "./routes/user.route";
import roleRouter from "./routes/role.route";
import { messages } from "./utils/error.messages";

const app: Application = express();
const PORT = process.env.PORT || 5050;

app.use(express.json());
app.use(cors());
app.use("/user", userRouter);

app.use("/role", roleRouter);

app.use("*", (_req, res) => {
  res.status(404).json({ message: messages.notFound });
});

app.listen(PORT, () => {
  logger.info(`Service is running on port ${PORT}`);
});
