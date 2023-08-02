import nodemailer from "nodemailer";
import logger from "./logger";

export const sendVerificationEmail = async (
  email: string,
  verificationCode: string
) => {
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
};
