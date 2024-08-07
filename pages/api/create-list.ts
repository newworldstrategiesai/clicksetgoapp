import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "utils/supabaseClient";
import { validate as uuidValidate } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    console.log(req.body); // Debug: Log the incoming request body

    const { name, contacts, user_id } = req.body;

    // Validate input
    if (!name || !user_id) {
      return res.status(400).json({ error: "Name and user_id are required." });
    }

    // Validate UUID format
    if (!uuidValidate(user_id)) {
      return res.status(400).json({ error: "Invalid user_id format." });
    }

    try {
      // Insert the new list into Supabase
      const { data, error } = await supabase
        .from("lists")
        .insert([{ name, user_id, contacts_count: contacts.length }])
        .single();

      if (error) {
        throw error;
      }

      res.status(200).json(data);
    } catch (error) {
      console.error("Error creating list:", error);
      res.status(500).json({ error: "Error creating list." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
