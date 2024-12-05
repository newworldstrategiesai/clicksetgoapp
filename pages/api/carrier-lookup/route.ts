import { NextResponse } from "next/server";
import twilio from "twilio";
import { config } from "@/lib/config";

const client = twilio(config.twilioAccountSid, config.twilioAuthToken);

interface CarrierInfo {
  name?: string;
  type?: string;
}

interface LookupResponse {
  carrier?: {
    name?: string;
    type?: string;
  };
}

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Look up carrier information using Twilio's Lookup API
    const lookup = await client.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch({ fields: 'carrier' }) as unknown as LookupResponse;

    return NextResponse.json({
      carrier: lookup.carrier?.name || "Unknown",
      type: lookup.carrier?.type || "Unknown",
    });
  } catch (error) {
    console.error("Error looking up carrier:", error);
    return NextResponse.json(
      { error: "Failed to look up carrier" },
      { status: 500 }
    );
  }
}