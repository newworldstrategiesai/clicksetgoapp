import { supabaseServer } from "@/utils/supabaseServerClient";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, trialStartDate, trialEndDate } = req.body;
  console.log(userId, trialEndDate, trialStartDate);

  if (!userId || !trialStartDate || !trialEndDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabaseServer
      .from("users")
      .update({
        trial_status: "active",
        trial_start_date: trialStartDate,
        trial_end_date: trialEndDate,
        onboarding_complete: true,
      })
      .eq("id", userId)
      .select();;

    if (error) {
      console.error("Error updating trial details:", error);
      return res.status(500).json({ error: "Failed to update trial details" });
    }

    res.status(200).json({ message: "Trial details updated successfully", data });
  } catch (err) {
    console.error("Unexpected error during trial activation:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
