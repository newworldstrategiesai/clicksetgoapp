import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import moment from "moment-timezone";
import cookie from "cookie";

const MAX_ATTEMPTS = 5; // Maximum OTP attempts allowed
const OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes OTP expiration time

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { phoneNumber, code: userOtp } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number is required." });
  }

  const currentTime = Date.now();

  if (req.method === "POST") {
    // Retrieve cookies
    const cookies = cookie.parse(req.headers.cookie || "");
    const otp = cookies.otp || null;
    const otpExpireTime = parseInt(cookies.otpExpireTime || "0", 10);
    const attempts = parseInt(cookies.attempts || "0", 10);

    if (!otp) {
      return res.status(400).json({ error: "No OTP requested yet." });
    }

    if (currentTime > otpExpireTime) {
      res.setHeader("Set-Cookie", [
        `otp=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
        `otpExpireTime=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
        `attempts=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
      ]);
      return res.status(401).json({ error: "OTP has expired. Please request a new one." });
    }

    if (attempts >= MAX_ATTEMPTS) {
      return res.status(403).json({ error: "Maximum attempts reached. Please request a new OTP." });
    }

    if (otp === userOtp) {
      res.setHeader("Set-Cookie", [
        `otp=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
        `otpExpireTime=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
        `attempts=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
      ]);
      return res.status(200).json({ message: "OTP verified successfully." });
    } else {
      res.setHeader("Set-Cookie", [
        `attempts=${attempts + 1}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=300`,
      ]);
      return res.status(401).json({ error: "Invalid OTP." });
    }
  }

  return res.status(405).json({ error: "Method not allowed." });
}
