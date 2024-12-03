// pages/api/initiate-caller-id-verification.ts

import type { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phoneNumber, twilioSid, twilioAuthToken } = req.body;

  if (!phoneNumber || !twilioSid || !twilioAuthToken) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const client = twilio(twilioSid, twilioAuthToken);

    const validationRequest = await client.validationRequests.create({
      phoneNumber,
      friendlyName: `User Verified Number ${phoneNumber}`,
    });

    // Extract the validation code from the response
    const validationCode = validationRequest.validationCode;

    // Send the validation code back to the client
    res.status(200).json({ success: true, validationCode });
  } catch (error) {
    console.error("Error initiating caller ID verification:", error);
    res.status(500).json({ error: "Failed to initiate verification" });
  }
}
