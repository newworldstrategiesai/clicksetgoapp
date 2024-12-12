import { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";

// Initialize Twilio Client with your account SID and Auth token
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Sample list of supported carriers (extend this list as needed)
const SUPPORTED_CARRIERS = ["AT&T", "Verizon", "T-Mobile", "Sprint", "US Cellular"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { phoneNumber } = req.body;
    console.log(phoneNumber);
    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    try {
      // Use the updated Twilio Lookup API (use the 'fetch' method on phoneNumbers)
      const phoneInfo = await twilioClient.lookups.v1.phoneNumbers(phoneNumber).fetch({ type: ["carrier"] });
        console.log(phoneInfo, "phoneInfo is comming from twilio");
      const carrier = phoneInfo.carrier?.name || "Unknown";

      // Validate the carrier against supported carriers
      const isSupported = SUPPORTED_CARRIERS.includes(carrier);
      
      // Simulate supported features (you can customize this further based on your requirements)
      const supportedFeatures = isSupported ? ["SMS", "Voice"] : [];

      // Store carrier info to a database or session (this is just an example)
      // You should ideally store this in a database (e.g., MongoDB, PostgreSQL, etc.)

      // Respond with carrier info and validation result
      return res.status(200).json({
        carrier,
        isSupported,
        supportedFeatures,
      });
    } catch (error) {
      console.error("Error detecting carrier:", error);
      return res.status(500).json({ error: "Failed to detect carrier" });
    }
  } else {
    // Handle unsupported HTTP methods
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
