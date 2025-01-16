// backend/api/assistant-setup.ts

import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/utils/supabaseClient";

const handleAssistantSetup = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET": {
      // Fetch existing assistant settings for the user
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const { data, error } = await supabase
        .from("businesses")
        .select("business_name, description, role, allow_appointments, default_duration, break_time")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching business settings:", error);
        return res.status(500).json({ error: "Failed to fetch assistant settings" });
      }

      return res.status(200).json(data);
    }

    case "POST": {
      // Save or update assistant settings for the user
      const { businessName, description, role, allowAppointments, defaultDuration, breakTime, userId } = req.body;

      if (!userId || !businessName) {
        return res.status(400).json({ error: "User ID and Business Name are required" });
      }

      const { data, error } = await supabase
        .from("businesses")
        .upsert({
          user_id: userId,
          name: businessName,
          description,
          allow_appointments: allowAppointments,
          default_duration: defaultDuration,
          break_time: breakTime,
        });

      if (error) {
        console.error("Error saving business settings:", error);
        return res.status(500).json({ error: "Failed to save assistant settings" });
      }

      return res.status(200).json({ message: "Assistant settings saved successfully", data });
    }

    default: {
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
};

export default handleAssistantSetup;
