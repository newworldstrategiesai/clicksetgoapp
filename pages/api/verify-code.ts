import { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";
import { supabaseServer } from "@/utils/supabaseServerClient";

const MAX_ATTEMPTS = 5; // Maximum OTP attempts allowed
const OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes OTP expiration time

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { phoneNumber, code: userOtp, userId, countryCode, phoneWithoutCC: phoneWithoutCountryCode } = req.body;
  console.log(phoneNumber, phoneWithoutCountryCode, userOtp, userId);

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

      try {
        // Update user data in Supabase
        const { data, error } = await supabaseServer
        .from("users")
        .update({ phone_number: phoneWithoutCountryCode, default_country_code: countryCode })
        .eq("id", userId)
        .select();

      if (error) {
        throw new Error(error.message || "Error updating data in Supabase");
      }

      // Retrieve the stepId for the "phone" step
      const { data: stepData, error: stepError } = await supabaseServer
        .from("onboarding_steps")
        .select("id")
        .eq("user_id", userId)
        .eq("name", "phone");

      if (stepError || !stepData?.length) {
        throw new Error(stepError?.message || "Error retrieving onboarding step.");
      }

      const stepId = stepData[0].id;

      // Insert onboarding step record for phone verification
      const { error: onboardingError } = await supabaseServer
        .from("user_onboarding_steps")
        .insert([
          {
            user_id: userId,
            step_id: stepId,
            completed_at: new Date().toISOString(),
          },
        ]);

      if (onboardingError) {
        throw new Error(onboardingError.message || "Error inserting onboarding step.");
      }

      return res.status(200).json({ message: "OTP verified successfully and user data updated.", data });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        return res.status(500).json({ error: errorMessage });
      }
    } else {
      res.setHeader("Set-Cookie", [
        `attempts=${attempts + 1}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=300`,
      ]);
      return res.status(401).json({ error: "Invalid OTP." });
    }
  }

  return res.status(405).json({ error: "Method not allowed." });
}
