import { NextResponse } from "next/server";
import twilio from "twilio";
import { config } from "@/lib/config";

const client = twilio(config.twilioAccountSid, config.twilioAuthToken);

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Generate a random 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Send SMS with verification code
    await client.messages.create({
      body: `Your Click Set Go verification code is: ${verificationCode}`,
      to: phoneNumber,
      from: config.twilioPhone,
    });

    // In a real app, store the code securely with an expiration time
    // For demo purposes, we'll store it in a cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("verificationCode", verificationCode.toString(), {
      httpOnly: true,
      maxAge: 300, // 5 minutes
    });

    return response;
  } catch (error) {
    console.error("Error sending verification code:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}