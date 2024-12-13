import { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromPhoneNumber = process.env.TWILIO_NUMBER!;

const client = twilio(accountSid, authToken);

// Function to generate a random 6-digit OTP
const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
};

const sendVerificationCode = async (phoneNumber: string, otp: string) => {
  try {
    const message = await client.messages.create({
      body: `Your verification code is: ${otp}`,
      from: fromPhoneNumber,
      to: phoneNumber,
    });
    return message;
  } catch (error) {
    const e = error as Error;
    throw new Error("Failed to send SMS: " + e.message);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    try {
      const otp = generateOtp(); // Generate a new OTP
      const otpExpireTime = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes

      // Send OTP via Twilio
      await sendVerificationCode(phoneNumber, otp);

      // Store OTP and expiration time in secure cookies
      res.setHeader("Set-Cookie", [
        `otp=${otp}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=300`, // Expires in 5 minutes
        `otpExpireTime=${otpExpireTime}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=300`,
        `phoneNumber=${phoneNumber}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=300`,
      ]);

      return res.status(200).json({ message: "Verification code sent" });
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
