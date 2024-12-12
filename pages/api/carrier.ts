import { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for a POST request, otherwise return an error
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phoneNumber } = req.body; // Get the phone number from the request body

  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  // Twilio credentials
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const client = twilio(accountSid, authToken);

  try {
    // Use Twilio's Lookups API to get phone number information
    const phoneData = await client.lookups.v2.phoneNumbers(phoneNumber).fetch({ fields: "sim_swap,call_forwarding" });
    console.log(phoneData, "PhoneData")
    // Return the phone number data
    res.status(200).json({ phoneNumber: phoneData.phoneNumber, countryCode: phoneData.countryCode });
  } catch (error) {
    console.error("Error fetching phone number data:", error);
    res.status(500).json({ error: "Failed to fetch phone number data" });
  }
}
