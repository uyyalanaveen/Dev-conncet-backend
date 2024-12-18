import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "../models/DB.js";

dotenv.config();
// In-memory OTP storage (for demo purposes only; use a database in production)
const otpStore = new Map(); // Format: { email: { otp, expiresAt } }

// Environment Variables (from .env file)
const { EMAIL_USER, EMAIL_PASS } = process.env;

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Request OTP Route
export const requestOtp = async (req, res) => {
  const { email } = req.body;

  // Validate email input
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

  // Store OTP in memory (Consider using a database for persistent storage)
  otpStore.set(email, { otp, expiresAt });

  // Send OTP via email
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Your OTP for Password Reset",
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again later." });
  }
};

// Validate OTP Route
export const validateOtp = (req, res) => {
  const { email, otp } = req.body;

  // Validate email and OTP inputs
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  // Check if OTP exists for the email
  const storedOtpData = otpStore.get(email);

  if (!storedOtpData) {
    return res.status(400).json({
      message: "No OTP found for this email. Please request a new one.",
    });
  }

  const { otp: storedOtp, expiresAt } = storedOtpData;

  // Check if OTP has expired
  if (Date.now() > expiresAt) {
    otpStore.delete(email); // Remove expired OTP from memory
    return res
      .status(400)
      .json({ message: "OTP has expired. Please request a new one." });
  }

  // Validate OTP
  if (otp !== storedOtp) {
    return res.status(400).json({ message: "Invalid OTP. Please try again." });
  }

  // OTP is valid
  otpStore.delete(email); // Remove OTP after successful validation
  res.status(200).json({ message: "OTP validated successfully" });
};

export const sendOtplogin = async (req, res) => {
  const { email } = req.body;

  // Validate email input
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "User already exists with this email" });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

  // Store OTP in memory (Consider using a database for persistent storage)
  otpStore.set(email, { otp, expiresAt });

  // Send OTP via email
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Your OTP for Password Reset",
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again later." });
  }
};
