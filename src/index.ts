import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import logger from "./utils/logger.ts";
import router from "./routes/user.route.ts";

const app: Application = express();
const PORT = process.env.PORT || 5050;

app.use(express.json());
app.use(cors());
app.use("/user", router);

// Nodemailer configuration
// const mailTransporter = nodemailer.createTransport({
//   service: "your_email_service_provider",
//   auth: {
//     user: "your_email",
//     pass: "your_email_password",
//   },
// });

app.listen(PORT, () => {
  logger.info(`Service is running on port ${PORT}`);
});
