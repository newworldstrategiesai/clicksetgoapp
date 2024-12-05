import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(request: Request) {
  try {
    const { twilioSid, twilioAuthToken, phoneNumber } = await request.json();

    if (!twilioSid || !twilioAuthToken || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const client = twilio(twilioSid, twilioAuthToken);

    // Create a validation request
    const validationRequest = await client.validationRequests.create({
      phoneNumber,
      friendlyName: `User Verified Number ${phoneNumber}`,
    });

    return NextResponse.json({
      success: true,
      validationCode: validationRequest.validationCode,
    });
  } catch (error) {
    console.error("Error initiating caller ID verification:", error);
    return NextResponse.json(
      { error: "Failed to initiate verification" },
      { status: 500 }
    );
  }
}